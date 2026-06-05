import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GuestUser, GuestUserDocument } from '../schemas/guest-user.schema';
import { EventsGateway } from '../events/events.gateway';
import { SocketEvents } from '@poker/shared';

@Injectable()
export class GuestUsersService {
  constructor(
    @InjectModel(GuestUser.name) private guestUserModel: Model<GuestUserDocument>,
    private events: EventsGateway,
  ) {}

  async findByRoom(roomId: string) {
    const users = await this.guestUserModel.find({ roomId }).lean();
    return users.map(this.toDTO);
  }

  async create(data: { name: string; roomId: string; spectator: boolean }) {
    const user = await this.guestUserModel.create(data);
    const dto = this.toDTO(user.toObject());
    this.events.emitToRoom(data.roomId, SocketEvents.GUEST_USER_CREATED, dto);
    return dto;
  }

  async toggleSpectator(id: string) {
    const user = await this.guestUserModel.findById(id).lean();
    if (!user) return null;
    const updated = await this.guestUserModel.findByIdAndUpdate(
      id,
      { spectator: !user.spectator },
      { new: true },
    ).lean();
    const dto = this.toDTO(updated);
    this.events.emitToRoom(updated.roomId.toString(), SocketEvents.GUEST_USER_CREATED, dto);
    return dto;
  }

  private toDTO(user: any) {
    return {
      id: user._id.toString(),
      name: user.name,
      roomId: user.roomId.toString(),
      spectator: user.spectator,
      inactive: user.inactive ?? false,
    };
  }
}
