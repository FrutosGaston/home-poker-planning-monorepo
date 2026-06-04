import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SocketEvents, ServerToClientEvents, ClientToServerEvents } from '@poker/shared';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  @SubscribeMessage('room:join')
  handleJoinRoom(@MessageBody() roomId: number) {
    // Client joins a socket.io room to receive room-specific events
    return roomId;
  }

  emitToRoom<K extends keyof ServerToClientEvents>(
    roomId: number,
    event: K,
    data: Parameters<ServerToClientEvents[K]>[0],
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.server.to(`room:${roomId}`) as any).emit(event, data);
  }
}
