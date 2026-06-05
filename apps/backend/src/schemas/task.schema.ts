import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Estimation, EstimationSchema } from './estimation.schema';
import { Card, CardSchema } from './card.schema';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true }) title: string;
  @Prop() description?: string;
  @Prop({ required: true }) roomId: string;
  @Prop({ type: [EstimationSchema], default: [] }) estimations: Estimation[];
  @Prop({ type: CardSchema, default: null }) finalEstimation: Card | null;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
