import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { RoomsModule } from './rooms/rooms.module';
import { TasksModule } from './tasks/tasks.module';
import { GuestUsersModule } from './guest-users/guest-users.module';
import { DecksModule } from './decks/decks.module';

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    RoomsModule,
    TasksModule,
    GuestUsersModule,
    DecksModule,
  ],
})
export class AppModule {}
