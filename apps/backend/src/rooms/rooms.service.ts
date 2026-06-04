import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { SocketEvents } from '@poker/shared';

const ROOM_INCLUDE = {
  deck: { include: { cards: true } },
  tasks: { include: { estimation: { include: { card: true } }, estimations: { include: { card: true } } } },
  guestUsers: true,
};

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService, private events: EventsGateway) {}

  async create(data: { title: string; description?: string; deckId: number }) {
    const room = await this.prisma.room.create({ data, include: ROOM_INCLUDE });
    return room;
  }

  async findByUUID(uuid: string) {
    const room = await this.prisma.room.findUnique({ where: { uuid }, include: ROOM_INCLUDE });
    if (!room) throw new NotFoundException(`Room ${uuid} not found`);
    return room;
  }

  async update(id: number, data: { selectedTaskId?: number }) {
    const room = await this.prisma.room.update({ where: { id }, data, include: ROOM_INCLUDE });
    this.events.emitToRoom(id, SocketEvents.ROOM_UPDATED, room as any);
    return room;
  }
}
