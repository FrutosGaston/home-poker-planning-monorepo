import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GuestUserDocument = GuestUser & Document;

@Schema({ timestamps: true })
export class GuestUser {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) roomId: string;
  @Prop({ default: false }) spectator: boolean;
}

export const GuestUserSchema = SchemaFactory.createForClass(GuestUser);
