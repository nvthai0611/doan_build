"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let PaymentGateway = PaymentGateway_1 = class PaymentGateway {
    constructor() {
        this.logger = new common_1.Logger(PaymentGateway_1.name);
        this.orderSubscriptions = new Map();
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.orderSubscriptions.forEach((sockets, orderCode) => {
            sockets.delete(client.id);
            if (sockets.size === 0) {
                this.orderSubscriptions.delete(orderCode);
            }
        });
    }
    handleSubscribePayment(client, payload) {
        const { orderCode } = payload;
        if (!orderCode) {
            return { success: false, message: 'Missing orderCode' };
        }
        if (!this.orderSubscriptions.has(orderCode)) {
            this.orderSubscriptions.set(orderCode, new Set());
        }
        this.orderSubscriptions.get(orderCode).add(client.id);
        this.logger.log(`Client ${client.id} subscribed to payment ${orderCode}`);
        return {
            success: true,
            message: `Subscribed to payment ${orderCode}`,
            orderCode
        };
    }
    handleUnsubscribePayment(client, payload) {
        const { orderCode } = payload;
        const sockets = this.orderSubscriptions.get(orderCode);
        if (sockets) {
            sockets.delete(client.id);
            if (sockets.size === 0) {
                this.orderSubscriptions.delete(orderCode);
            }
        }
        this.logger.log(`Client ${client.id} unsubscribed from payment ${orderCode}`);
        return {
            success: true,
            message: `Unsubscribed from payment ${orderCode}`
        };
    }
    notifyPaymentSuccess(orderCode, data) {
        const sockets = this.orderSubscriptions.get(orderCode);
        if (!sockets || sockets.size === 0) {
            this.logger.warn(`No clients subscribed to payment ${orderCode}`);
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
        this.logger.log(`Notified ${sockets.size} clients about payment ${orderCode}`);
        this.orderSubscriptions.delete(orderCode);
    }
    notifyPaymentFailure(orderCode, reason) {
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
        this.logger.log(`Notified ${sockets.size} clients about payment failure ${orderCode}`);
        this.orderSubscriptions.delete(orderCode);
    }
    notifyPaymentExpired(orderCode) {
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
        this.logger.log(`Notified ${sockets.size} clients about payment expiry ${orderCode}`);
        this.orderSubscriptions.delete(orderCode);
    }
};
exports.PaymentGateway = PaymentGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], PaymentGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('subscribe_payment'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], PaymentGateway.prototype, "handleSubscribePayment", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('unsubscribe_payment'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], PaymentGateway.prototype, "handleUnsubscribePayment", null);
exports.PaymentGateway = PaymentGateway = PaymentGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:5173',
            credentials: true,
        },
        namespace: 'payment',
    })
], PaymentGateway);
//# sourceMappingURL=payment.gateway.js.map