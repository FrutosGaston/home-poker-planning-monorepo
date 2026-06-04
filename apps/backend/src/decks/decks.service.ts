import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DecksService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.deck.findMany({ include: { cards: true } });
  }
}
