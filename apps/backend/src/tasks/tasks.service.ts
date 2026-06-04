import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../schemas/task.schema';
import { Deck, DeckDocument } from '../schemas/deck.schema';
import { EventsGateway } from '../events/events.gateway';
import { SocketEvents } from '@poker/shared';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Deck.name) private deckModel: Model<DeckDocument>,
    private events: EventsGateway,
  ) {}

  async findByRoom(roomId: string) {
    const tasks = await this.taskModel.find({ roomId }).lean();
    return tasks.map(this.toDTO);
  }

  async create(data: { title: string; roomId: string }) {
    const task = await this.taskModel.create(data);
    const dto = this.toDTO(task.toObject());
    this.events.emitToRoom(data.roomId, SocketEvents.TASK_CREATED, dto);
    return dto;
  }

  async update(id: string, data: Partial<{ title: string }>) {
    const task = await this.taskModel.findByIdAndUpdate(id, data, { new: true }).lean();
    if (!task) throw new NotFoundException('Task not found');
    return this.toDTO(task);
  }

  async createEstimation(data: { cardId: string; taskId: string; guestUserId: string }) {
    const deck = await this.deckModel.findOne({ 'cards._id': data.cardId }).lean();
    if (!deck) throw new NotFoundException('Card not found');
    const card = deck.cards.find((c: any) => c._id.toString() === data.cardId);

    // Deactivate previous estimation from same user
    await this.taskModel.updateOne(
      { _id: data.taskId },
      { $set: { 'estimations.$[e].active': false } },
      { arrayFilters: [{ 'e.guestUserId': data.guestUserId }] },
    );

    const task = await this.taskModel.findByIdAndUpdate(
      data.taskId,
      { $push: { estimations: { card, guestUserId: data.guestUserId, active: true } } },
      { new: true },
    ).lean();

    if (!task) throw new NotFoundException('Task not found');
    const dto = this.toDTO(task);
    const estimation = dto.estimations[dto.estimations.length - 1];
    this.events.emitToRoom(task.roomId, SocketEvents.ESTIMATION_CREATED, estimation);
    return estimation;
  }

  async createFinalEstimation(data: { cardId: string; taskId: string }) {
    const deck = await this.deckModel.findOne({ 'cards._id': data.cardId }).lean();
    if (!deck) throw new NotFoundException('Card not found');
    const card = deck.cards.find((c: any) => c._id.toString() === data.cardId);

    const task = await this.taskModel.findByIdAndUpdate(
      data.taskId,
      { $set: { finalEstimation: card } },
      { new: true },
    ).lean();

    if (!task) throw new NotFoundException('Task not found');
    const dto = this.toDTO(task);
    this.events.emitToRoom(task.roomId, SocketEvents.TASK_ESTIMATED, dto);
    return dto;
  }

  async invalidateEstimations(taskId: string) {
    const task = await this.taskModel.findByIdAndUpdate(
      taskId,
      { $set: { estimations: [], finalEstimation: null } },
      { new: true },
    ).lean();

    if (!task) throw new NotFoundException('Task not found');
    const dto = this.toDTO(task);
    this.events.emitToRoom(task.roomId, SocketEvents.ESTIMATIONS_INVALIDATED, dto);
    return dto;
  }

  private toDTO(task: any) {
    return {
      id: task._id.toString(),
      roomId: task.roomId.toString(),
      title: task.title,
      finalEstimation: task.finalEstimation
        ? { id: task.finalEstimation._id.toString(), value: task.finalEstimation.value }
        : null,
      estimations: (task.estimations ?? [])
        .filter((e: any) => e.active)
        .map((e: any) => ({
          id: e._id.toString(),
          card: { id: e.card._id.toString(), value: e.card.value },
          guestUserId: e.guestUserId,
          active: e.active,
        })),
    };
  }
}
