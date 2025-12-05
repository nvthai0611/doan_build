import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
interface PaymentSuccessData {
    orderCode: string;
    paymentId: string;
    amount: number;
    paidAt: string;
}
export declare class PaymentGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private orderSubscriptions;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleSubscribePayment(client: Socket, payload: {
        orderCode: string;
    }): {
        success: boolean;
        message: string;
        orderCode?: undefined;
    } | {
        success: boolean;
        message: string;
        orderCode: string;
    };
    handleUnsubscribePayment(client: Socket, payload: {
        orderCode: string;
    }): {
        success: boolean;
        message: string;
    };
    notifyPaymentSuccess(orderCode: string, data: PaymentSuccessData): void;
    notifyPaymentFailure(orderCode: string, reason: string): void;
    notifyPaymentExpired(orderCode: string): void;
}
export {};
