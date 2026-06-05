import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GuestUser, GuestUserDocument } from '../schemas/guest-user.schema';
import { EventsGateway } from '../events/events.gateway';
import { SocketEvents } from '@poker/shared';

const INACTIVE_AFTER_MS = 60_000;   // grey out after 60s without heartbeat
const DELETE_AFTER_MS = 5 * 60_000; // delete after 5 min

@Injectable()
export class GuestUsersCron {
  constructor(
    @InjectModel(GuestUser.name) private guestUserModel: Model<GuestUserDocument>,
    private events: EventsGateway,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkInactiveUsers() {
    const now = Date.now();
    const inactiveCutoff = new Date(now - INACTIVE_AFTER_MS);
    const deleteCutoff = new Date(now - DELETE_AFTER_MS);

    // Delete users inactive for >5 min (or missing lastSeen entirely)
    const toDelete = await this.guestUserModel.find({
      $or: [
        { lastSeen: { $lt: deleteCutoff } },
        { lastSeen: { $exists: false } },
      ],
    }).lean();

    for (const user of toDelete) {
      await this.guestUserModel.findByIdAndDelete(user._id);
      this.events.emitToRoom(user.roomId.toString(), SocketEvents.GUEST_USER_LEFT, {
        id: user._id.toString(), name: user.name,
        roomId: user.roomId.toString(), spectator: user.spectator, inactive: true,
      });
    }

    // Mark users inactive (60s-5min without heartbeat)
    const toMarkInactive = await this.guestUserModel.find({
      lastSeen: { $lt: inactiveCutoff, $gte: deleteCutoff },
      inactive: false,
    }).lean();

    for (const user of toMarkInactive) {
      await this.guestUserModel.findByIdAndUpdate(user._id, { inactive: true });
      this.events.emitToRoom(user.roomId.toString(), SocketEvents.GUEST_USER_CREATED, {
        id: user._id.toString(), name: user.name,
        roomId: user.roomId.toString(), spectator: user.spectator, inactive: true,
      });
    }
  }
}
