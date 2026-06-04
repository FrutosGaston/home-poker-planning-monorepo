import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RoomDocument = Room & Document;

@Schema({ timestamps: true })
export class Room {
  @Prop({ required: true, unique: true }) uuid: string;
  @Prop({ required: true }) title: string;
  @Prop() description?: string;
  @Prop({ type: Types.ObjectId, ref: 'Deck', required: true }) deckId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Task', default: null }) selectedTaskId: Types.ObjectId | null;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
