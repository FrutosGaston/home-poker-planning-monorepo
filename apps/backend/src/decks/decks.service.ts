import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Deck, DeckDocument } from '../schemas/deck.schema';

@Injectable()
export class DecksService {
  constructor(@InjectModel(Deck.name) private deckModel: Model<DeckDocument>) {}

  async findAll() {
    const decks = await this.deckModel.find().lean();
    return decks.map((d: any) => ({
      id: d._id.toString(),
      name: d.name,
      cards: d.cards.map((c: any) => ({ id: c._id.toString(), value: c.value })),
    }));
  }
}
