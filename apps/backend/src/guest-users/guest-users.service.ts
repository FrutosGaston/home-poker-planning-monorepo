import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { SocketEvents } from '@poker/shared';

@Injectable()
export class GuestUsersService {
  constructor(private prisma: PrismaService, private events: EventsGateway) {}

  async findByRoom(roomId: number) {
    return this.prisma.guestUser.findMany({ where: { roomId } });
  }

  async create(data: { name: string; roomId: number; spectator: boolean }) {
    const user = await this.prisma.guestUser.create({ data });
    this.events.emitToRoom(data.roomId, SocketEvents.GUEST_USER_CREATED, user as any);
    return user;
  }
}
