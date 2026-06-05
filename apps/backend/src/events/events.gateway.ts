import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketEvents, ServerToClientEvents, ClientToServerEvents } from '@poker/shared';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GuestUser, GuestUserDocument } from '../schemas/guest-user.schema';

interface ReactionDto {
  emoji: string;
  userId: string;
  userName: string;
  roomId: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server<ClientToServerEvents, ServerToClientEvents>;

  constructor(
    @InjectModel(GuestUser.name) private guestUserModel: Model<GuestUserDocument>,
  ) {}

  @SubscribeMessage('room:join')
  handleJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() roomId: string) {
    socket.join(`room:${roomId}`);
    return roomId;
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@MessageBody() userId: string) {
    const prev = await this.guestUserModel.findById(userId).lean();
    await this.guestUserModel.findByIdAndUpdate(userId, { lastSeen: new Date(), inactive: false });

    if (prev?.inactive) {
      const dto = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: (prev as any)._id.toString(),
        name: prev.name,
        roomId: prev.roomId.toString(),
        spectator: prev.spectator,
        inactive: false,
      };
      this.emitToRoom(prev.roomId.toString(), SocketEvents.GUEST_USER_CREATED, dto);
    }
  }

  @SubscribeMessage('reaction')
  handleReaction(@MessageBody() data: ReactionDto) {
    // Broadcast to everyone in the room including sender
    this.emitToRoom(data.roomId, SocketEvents.REACTION, data);
  }

  emitToRoom<K extends keyof ServerToClientEvents>(
    roomId: string,
    event: K,
    data: Parameters<ServerToClientEvents[K]>[0],
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.server.to(`room:${roomId}`) as any).emit(event, data);
  }
}
