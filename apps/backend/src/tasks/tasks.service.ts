import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { SocketEvents } from '@poker/shared';

const TASK_INCLUDE = {
  estimation: { include: { card: true } },
  estimations: { include: { card: true } },
};

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService, private events: EventsGateway) {}

  async findByRoom(roomId: number) {
    return this.prisma.task.findMany({ where: { roomId }, include: TASK_INCLUDE });
  }

  async create(data: { title: string; roomId: number }) {
    const task = await this.prisma.task.create({ data, include: TASK_INCLUDE });
    this.events.emitToRoom(data.roomId, SocketEvents.TASK_CREATED, task as any);
    return task;
  }

  async update(id: number, data: Partial<{ title: string }>) {
    const task = await this.prisma.task.update({ where: { id }, data, include: TASK_INCLUDE });
    return task;
  }

  async createEstimation(data: { cardId: number; taskId: number; guestUserId: number }) {
    // Deactivate previous estimation from same user on same task
    await this.prisma.estimation.updateMany({
      where: { taskId: data.taskId, guestUserId: data.guestUserId, active: true },
      data: { active: false },
    });

    const estimation = await this.prisma.estimation.create({
      data: { cardId: data.cardId, taskId: data.taskId, guestUserId: data.guestUserId },
      include: { card: true },
    });

    const task = await this.prisma.task.findUnique({ where: { id: data.taskId }, include: { room: true } });
    if (task) this.events.emitToRoom(task.roomId, SocketEvents.ESTIMATION_CREATED, estimation as any);

    return estimation;
  }

  async createFinalEstimation(data: { cardId: number; taskId: number }) {
    const estimation = await this.prisma.estimation.create({
      data: { cardId: data.cardId, taskId: data.taskId, guestUserId: 0 },
      include: { card: true },
    });

    const task = await this.prisma.task.update({
      where: { id: data.taskId },
      data: { estimationId: estimation.id },
      include: TASK_INCLUDE,
    });

    this.events.emitToRoom(task.roomId, SocketEvents.TASK_ESTIMATED, task as any);
    return task;
  }

  async invalidateEstimations(taskId: number) {
    await this.prisma.estimation.updateMany({
      where: { taskId, active: true },
      data: { active: false },
    });

    const task = await this.prisma.task.update({
      where: { id: taskId },
      data: { estimationId: null },
      include: TASK_INCLUDE,
    });

    this.events.emitToRoom(task.roomId, SocketEvents.ESTIMATIONS_INVALIDATED, task as any);
    return task;
  }
}
