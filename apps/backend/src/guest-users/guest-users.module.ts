import { Module } from '@nestjs/common';
import { GuestUsersController } from './guest-users.controller';
import { GuestUsersService } from './guest-users.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [GuestUsersController],
  providers: [GuestUsersService],
})
export class GuestUsersModule {}
