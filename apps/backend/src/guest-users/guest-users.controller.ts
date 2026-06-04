import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GuestUsersService } from './guest-users.service';

@ApiTags('guest-users')
@Controller('api/v1/guest-users')
export class GuestUsersController {
  constructor(private readonly guestUsersService: GuestUsersService) {}

  @Get()
  findByRoom(@Query('roomId') roomId: string) {
    return this.guestUsersService.findByRoom(+roomId);
  }

  @Post()
  create(@Body() body: { name: string; roomId: number; spectator: boolean }) {
    return this.guestUsersService.create(body);
  }
}
