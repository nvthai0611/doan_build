import { io, Socket } from 'socket.io-client';

interface PaymentSuccessData {
  orderCode: string;
  status: 'success';
  paymentId: string;
  amount: number;
  paidAt: string;
  timestamp: string;
  allocations: Array<{
    feeRecordId: string;
    amount: number;
    studentName: string;
    studentCode: string;
  }>;
}

interface PaymentFailedData {
  orderCode: string;
  status: 'failed';
  reason: string;
  timestamp: string;
}

interface PaymentExpiredData {
  orderCode: string;
  status: 'expired';
  timestamp: string;
}

class PaymentSocketService {
  private socket: Socket | null = null;
  private orderCode: string | null = null;

  /**
   * Kết nối socket
   */
  connect() {
    if (this.socket?.connected) return;

    const apiURL = import.meta.env.VITE_SERVER_API_V1 || 'http://localhost:9999/api/v1';
    const baseURL = new URL(apiURL).origin;
    this.socket = io(`${baseURL}/payment`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Payment socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Payment socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });
  }

  /**
   * Subscribe để lắng nghe payment status theo orderCode
   */
  subscribeToPayment(
    orderCode: string,
    callbacks: {
      onSuccess?: (data: PaymentSuccessData) => void;
      onFailure?: (data: PaymentFailedData) => void;
      onExpired?: (data: PaymentExpiredData) => void;
    }
  ) {
    if (!this.socket) {
      this.connect();
    }

    this.orderCode = orderCode;

    // Emit subscribe event
    this.socket?.emit('subscribe_payment', { orderCode }, (response: any) => {
      console.log('Subscribe response:', response);
    });

    // Listen for payment success
    this.socket?.on('payment_success', (data: PaymentSuccessData) => {
      console.log('💰 Payment success:', data);
      if (data.orderCode === orderCode) {
        callbacks.onSuccess?.(data);
      }
    });

    // Listen for payment failure
    if (callbacks.onFailure) {
      this.socket?.on('payment_failed', (data: PaymentFailedData) => {
        console.log('❌ Payment failed:', data);
        if (data.orderCode === orderCode) {
          callbacks.onFailure?.(data);
        }
      });
    }

    // Listen for payment expired
    if (callbacks.onExpired) {
      this.socket?.on('payment_expired', (data: PaymentExpiredData) => {
        console.log('⏰ Payment expired:', data);
        if (data.orderCode === orderCode) {
          callbacks.onExpired?.(data);
        }
      });
    }
  }

  /**
   * Unsubscribe khỏi payment
   */
  unsubscribeFromPayment(orderCode?: string) {
    const code = orderCode || this.orderCode;
    
    if (code && this.socket) {
      this.socket.emit('unsubscribe_payment', { orderCode: code });
      this.socket.off('payment_success');
      this.socket.off('payment_failed');
      this.socket.off('payment_expired');
      this.orderCode = null;
    }
  }

  /**
   * Disconnect socket
   */
  disconnect() {
    if (this.socket) {
      this.unsubscribeFromPayment();
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const paymentSocketService = new PaymentSocketService();