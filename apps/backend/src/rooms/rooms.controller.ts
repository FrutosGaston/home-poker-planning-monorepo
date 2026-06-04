import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@Controller('api/v1/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@Body() body: { title: string; description?: string; deckId: string }) {
    return this.roomsService.create(body);
  }

  @Get(':uuid')
  findOne(@Param('uuid') uuid: string) {
    return this.roomsService.findByUUID(uuid);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: { selectedTaskId?: string }) {
    return this.roomsService.update(id, body);
  }
}
