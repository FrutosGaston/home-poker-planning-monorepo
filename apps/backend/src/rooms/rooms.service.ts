import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Room, RoomDocument } from '../schemas/room.schema';
import { Deck, DeckDocument } from '../schemas/deck.schema';
import { EventsGateway } from '../events/events.gateway';
import { SocketEvents } from '@poker/shared';

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name) private roomModel: Model<RoomDocument>,
    @InjectModel(Deck.name) private deckModel: Model<DeckDocument>,
    private events: EventsGateway,
  ) {}

  async create(data: { title: string; description?: string; deckId: string }) {
    const deck = await this.deckModel.findById(data.deckId).lean();
    if (!deck) throw new NotFoundException('Deck not found');
    const room = await this.roomModel.create({ ...data, uuid: uuidv4() });
    return this.toDTO(room, deck);
  }

  async findByUUID(uuid: string) {
    const room = await this.roomModel.findOne({ uuid }).lean();
    if (!room) throw new NotFoundException(`Room ${uuid} not found`);
    const deck = await this.deckModel.findById(room.deckId).lean();
    return this.toDTO(room, deck);
  }

  async update(id: string, data: { selectedTaskId?: string; autoReveal?: boolean }) {
    const room = await this.roomModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!room) throw new NotFoundException('Room not found');
    const deck = await this.deckModel.findById(room.deckId).lean();
    const dto = this.toDTO(room, deck);
    this.events.emitToRoom(room._id.toString(), SocketEvents.ROOM_UPDATED, dto);
    return dto;
  }

  private toDTO(room: any, deck: any) {
    return {
      id: room._id.toString(),
      uuid: room.uuid,
      title: room.title,
      description: room.description,
      deckId: room.deckId.toString(),
      selectedTaskId: room.selectedTaskId?.toString(),
      autoReveal: room.autoReveal ?? true,
      deck: {
        id: deck._id.toString(),
        name: deck.name,
        cards: deck.cards.map((c: any) => ({ id: c._id.toString(), value: c.value })),
      },
    };
  }
}
