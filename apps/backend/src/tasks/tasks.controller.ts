import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@Controller('api/v1/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findByRoom(@Query('roomId') roomId: string) {
    return this.tasksService.findByRoom(roomId);
  }

  @Post()
  create(@Body() body: { title: string; roomId: string }) {
    return this.tasksService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { title?: string }) {
    return this.tasksService.update(id, body);
  }

  @Post('estimations')
  createEstimation(@Body() body: { cardId: string; taskId: string; guestUserId: string }) {
    return this.tasksService.createEstimation(body);
  }

  @Post('final-estimations')
  createFinalEstimation(@Body() body: { cardId: string; taskId: string }) {
    return this.tasksService.createFinalEstimation(body);
  }

  @Delete(':id/estimations')
  invalidateEstimations(@Param('id') id: string) {
    return this.tasksService.invalidateEstimations(id);
  }
}
