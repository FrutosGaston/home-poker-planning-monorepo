import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GuestUsersController } from './guest-users.controller';
import { GuestUsersService } from './guest-users.service';
import { GuestUsersCron } from './guest-users.cron';
import { EventsModule } from '../events/events.module';
import { GuestUser, GuestUserSchema } from '../schemas/guest-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: GuestUser.name, schema: GuestUserSchema }]),
    EventsModule,
  ],
  controllers: [GuestUsersController],
  providers: [GuestUsersService, GuestUsersCron],
})
export class GuestUsersModule {}
