import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Card, CardSchema } from './card.schema';

export type DeckDocument = Deck & Document;

@Schema({ timestamps: true })
export class Deck {
  @Prop({ required: true }) name: string;
  @Prop({ type: [CardSchema], default: [] }) cards: Card[];
}

export const DeckSchema = SchemaFactory.createForClass(Deck);
