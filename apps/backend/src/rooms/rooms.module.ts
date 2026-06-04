import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { EventsModule } from '../events/events.module';
import { Room, RoomSchema } from '../schemas/room.schema';
import { Deck, DeckSchema } from '../schemas/deck.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Room.name, schema: RoomSchema },
      { name: Deck.name, schema: DeckSchema },
    ]),
    EventsModule,
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
