import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DecksService } from './decks.service';

@ApiTags('decks')
@Controller('api/v1/decks')
export class DecksController {
  constructor(private readonly decksService: DecksService) {}

  @Get()
  findAll() {
    return this.decksService.findAll();
  }
}
