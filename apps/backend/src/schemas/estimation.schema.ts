import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Card, CardSchema } from './card.schema';

// Embedded in Task — not a standalone collection
@Schema({ _id: true, timestamps: true })
export class Estimation {
  _id: Types.ObjectId;

  @Prop({ type: CardSchema, required: true }) card: Card;
  @Prop({ required: true }) guestUserId: string;
  @Prop({ default: true }) active: boolean;
}

export const EstimationSchema = SchemaFactory.createForClass(Estimation);
