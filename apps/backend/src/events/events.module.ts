import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsGateway } from './events.gateway';
import { GuestUser, GuestUserSchema } from '../schemas/guest-user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: GuestUser.name, schema: GuestUserSchema }])],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
