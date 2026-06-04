import mongoose from 'mongoose';
import { DeckSchema } from './schemas/deck.schema';

const DECKS = [
  {
    name: 'Fibonacci',
    cards: ['0', '1', '2', '3', '5', '8', '13', '21', '34', '55', '89', '?', '☕'],
  },
  {
    name: 'Modified Fibonacci',
    cards: ['0', '½', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', '☕'],
  },
  {
    name: 'T-Shirt Sizes',
    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '?'],
  },
  {
    name: 'Powers of 2',
    cards: ['0', '1', '2', '4', '8', '16', '32', '64', '?', '☕'],
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/poker_planning';
  await mongoose.connect(uri);

  const DeckModel = mongoose.model('Deck', DeckSchema);

  for (const deck of DECKS) {
    const existing = await DeckModel.findOne({ name: deck.name });
    if (existing) {
      console.log(`"${deck.name}" already exists, skipping.`);
      continue;
    }
    await DeckModel.create({ name: deck.name, cards: deck.cards.map(value => ({ value })) });
    console.log(`Seeded "${deck.name}".`);
  }

  await mongoose.disconnect();
}

seed().catch(console.error);
