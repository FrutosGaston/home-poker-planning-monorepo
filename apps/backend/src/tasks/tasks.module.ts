import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { EventsModule } from '../events/events.module';
import { Task, TaskSchema } from '../schemas/task.schema';
import { Deck, DeckSchema } from '../schemas/deck.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Task.name, schema: TaskSchema },
      { name: Deck.name, schema: DeckSchema },
    ]),
    EventsModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
