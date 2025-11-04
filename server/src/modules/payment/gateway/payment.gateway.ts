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
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PaymentGateway.name);
  
  // Map lưu connection: orderCode -> Set<socketId>
  private orderSubscriptions: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
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
  }

  /**
   * Client subscribe để lắng nghe payment status theo orderCode
   */
  @SubscribeMessage('subscribe_payment')
  handleSubscribePayment(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { orderCode: string },
  ) {
    const { orderCode } = payload;

    if (!orderCode) {
      return { success: false, message: 'Missing orderCode' };
    }

    if (!this.orderSubscriptions.has(orderCode)) {
      this.orderSubscriptions.set(orderCode, new Set());
    }

    this.orderSubscriptions.get(orderCode).add(client.id);

    this.logger.log(
      `Client ${client.id} subscribed to payment ${orderCode}`,
    );

    return { 
      success: true, 
      message: `Subscribed to payment ${orderCode}`,
      orderCode 
    };
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