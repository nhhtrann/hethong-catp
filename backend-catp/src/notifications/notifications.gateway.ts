import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// Cấu hình cors: '*' để cho phép Frontend React gọi vào thoải mái không bị chặn
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // Mảng lưu trữ danh sách các máy đang online (UserId -> SocketId)
  private activeConnections = new Map<string, string>();

  // Hàm chạy khi có một trình duyệt kết nối vào Socket
  handleConnection(client: Socket) {
    console.log(`⚡ Có trình duyệt vừa kết nối Socket: ${client.id}`);
  }

  // Hàm chạy khi người dùng tắt trình duyệt hoặc logout
  handleDisconnect(client: Socket) {
    // Tìm và xóa người dùng khỏi danh sách online
    for (const [userId, socketId] of this.activeConnections.entries()) {
      if (socketId === client.id) {
        this.activeConnections.delete(userId);
        console.log(`❌ Người dùng ${userId} đã ngắt kết nối.`);
        break;
      }
    }
  }

  // 👉 LẮP ĐƯỜNG DÂY: Khi đăng nhập xong, Frontend sẽ gửi tin nhắn "register" kèm userId lên đây
  @SubscribeMessage('register')
  handleRegister(@MessageBody() userId: number, @ConnectedSocket() client: Socket) {
    if (userId) {
      this.activeConnections.set(userId.toString(), client.id);
      console.log(`🆔 Đã đăng ký đường dây Real-time cho User ID: ${userId} (Socket: ${client.id})`);
    }
  }

  // 👉 HÀM THẦN THÁNH: Hàm này sẽ được gọi từ các Service khác để bắn tín hiệu về máy người dùng
  sendNotificationToUser(userId: number, data: any) {
    const socketId = this.activeConnections.get(userId.toString());
    if (socketId) {
      // Nếu người dùng đang online, bắn trực tiếp sự kiện 'new_notification' ra màn hình của họ
      this.server.to(socketId).emit('new_notification', data);
      console.log(`🔔 Đã bắn thông báo Real-time thành công tới User ID: ${userId}`);
    } else {
      console.log(`💤 User ID: ${userId} hiện đang offline, chỉ lưu DB không bắn Real-time.`);
    }
  }
}