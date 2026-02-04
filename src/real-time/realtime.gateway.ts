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
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`[WS] client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[WS] client disconnected: ${client.id}`);
  }

  emitUserOnline(payload: { userId: number; email?: string }) {
    this.server.emit('user_online', payload); // broadcast to all connected clients
  }

  @SubscribeMessage('fake_event')
  handleFakeEvent(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    this.logger.log(
      `[WS] fake_event from, clientId: ${client.id}, payload: ${data}`,
    );
    return { ok: true }; // optional ack response
  }
}
