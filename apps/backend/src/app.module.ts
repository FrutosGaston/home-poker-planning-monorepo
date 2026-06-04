import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsModule } from './events/events.module';
import { RoomsModule } from './rooms/rooms.module';
import { TasksModule } from './tasks/tasks.module';
import { GuestUsersModule } from './guest-users/guest-users.module';
import { DecksModule } from './decks/decks.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/poker_planning'),
    EventsModule,
    RoomsModule,
    TasksModule,
    GuestUsersModule,
    DecksModule,
  ],
})
export class AppModule {}
