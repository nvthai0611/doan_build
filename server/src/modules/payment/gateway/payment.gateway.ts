import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../db/prisma.service';

interface PaymentSuccessData {
  orderCode: string;
  paymentId: string;
  amount: number;
  paidAt: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
  namespace: 'payment',
})
export class PaymentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PaymentGateway.name);
  
  // Map lưu connection: orderCode -> Set<socketId>
  private orderSubscriptions: Map<string, Set<string>> = new Map();
  // Map lưu userId của mỗi socket
  private userSockets: Map<string, string> = new Map();
  async handleConnection(client: Socket) {
    try {
      // 1. Lấy token từ handshake auth
      const token = client.handshake.auth?.token;
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // 2. Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.id;

      // 3. Lưu userId vào map
      this.userSockets.set(client.id, userId);
      
      this.logger.log(`Client ${client.id} connected as user ${userId}`);
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Cleanup subscriptions khi client disconnect
    this.orderSubscriptions.forEach((sockets, orderCode) => {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.orderSubscriptions.delete(orderCode);
      }
    });

    // Cleanup
    this.userSockets.delete(client.id);
  }

  /**
   * Client subscribe để lắng nghe payment status theo orderCode
   */
  @SubscribeMessage('subscribe_payment')
  async handleSubscribePayment(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { orderCode: string },
  ) {
    const { orderCode } = payload;

    // 1. Lấy userId từ socket
    const userId = this.userSockets.get(client.id);
    if (!userId) {
      return { success: false, message: 'Unauthorized' };
    }

    try {
      // 2. Kiểm tra payment có thuộc về user này không
      const payment = await this.prisma.payment.findUnique({
        where: { transactionCode: orderCode }, // orderCode chính là transactionCode
        select: { parentId: true },
      });

      if (!payment) {
        return { success: false, message: 'Payment not found' };
      }

      // 3. Verify ownership
      if (payment.parentId !== userId) {
        this.logger.warn(
          `User ${userId} tried to subscribe to payment ${orderCode} owned by ${payment.parentId}`,
        );
        return { success: false, message: 'Forbidden: Not your payment' };
      }

      // 4. Cho phép subscribe
      if (!this.orderSubscriptions.has(orderCode)) {
        this.orderSubscriptions.set(orderCode, new Set());
      }
      this.orderSubscriptions.get(orderCode).add(client.id);

      this.logger.log(`User ${userId} subscribed to payment ${orderCode}`);
      return { success: true, message: `Subscribed to payment ${orderCode}` };
      
    } catch (error) {
      this.logger.error(`Error in handleSubscribePayment: ${error.message}`);
      return { success: false, message: 'Internal server error' };
    }
  }

  /**
   * Client unsubscribe khỏi payment
   */
  @SubscribeMessage('unsubscribe_payment')
  handleUnsubscribePayment(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { orderCode: string },
  ) {
    const { orderCode } = payload;
    const sockets = this.orderSubscriptions.get(orderCode);

    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.orderSubscriptions.delete(orderCode);
      }
    }

    this.logger.log(
      `Client ${client.id} unsubscribed from payment ${orderCode}`,
    );

    return { 
      success: true, 
      message: `Unsubscribed from payment ${orderCode}` 
    };
  }

  /**
   * Notify tất cả clients đang subscribe về payment success
   */
  notifyPaymentSuccess(orderCode: string, data: PaymentSuccessData) {
    const sockets = this.orderSubscriptions.get(orderCode);

    if (!sockets || sockets.size === 0) {
      this.logger.warn(
        `No clients subscribed to payment ${orderCode}`,
      );
      return;
    }

    const payload = {
      orderCode,
      status: 'success',
      timestamp: new Date().toISOString(),
      ...data,
    };

    sockets.forEach((socketId) => {
      this.server.to(socketId).emit('payment_success', payload);
    });

    this.logger.log(
      `Notified ${sockets.size} clients about payment ${orderCode}`,
    );

    // Cleanup subscriptions sau khi notify
    this.orderSubscriptions.delete(orderCode);
  }

  /**
   * Notify về payment failure
   */
  notifyPaymentFailure(orderCode: string, reason: string) {
    const sockets = this.orderSubscriptions.get(orderCode);

    if (!sockets || sockets.size === 0) {
      return;
    }

    const payload = {
      orderCode,
      status: 'failed',
      reason,
      timestamp: new Date().toISOString(),
    };

    sockets.forEach((socketId) => {
      this.server.to(socketId).emit('payment_failed', payload);
    });

    this.logger.log(
      `Notified ${sockets.size} clients about payment failure ${orderCode}`,
    );

    this.orderSubscriptions.delete(orderCode);
  }

  /**
   * Notify về payment expired (QR code hết hạn)
   */
  notifyPaymentExpired(orderCode: string) {
    const sockets = this.orderSubscriptions.get(orderCode);

    if (!sockets || sockets.size === 0) {
      return;
    }

    const payload = {
      orderCode,
      status: 'expired',
      timestamp: new Date().toISOString(),
    };

    sockets.forEach((socketId) => {
      this.server.to(socketId).emit('payment_expired', payload);
    });

    this.logger.log(
      `Notified ${sockets.size} clients about payment expiry ${orderCode}`,
    );

    this.orderSubscriptions.delete(orderCode);
  }
}