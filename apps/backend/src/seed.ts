import mongoose from 'mongoose';
import { DeckSchema } from './schemas/deck.schema';

async function seed() {
  const uri = process.env.MONGODB_URI ?? 'mongodb://localhost:27017/poker_planning';
  await mongoose.connect(uri);

  const DeckModel = mongoose.model('Deck', DeckSchema);

  const existing = await DeckModel.findOne({ name: 'Fibonacci' });
  if (existing) {
    console.log('Fibonacci deck already exists, skipping seed.');
    await mongoose.disconnect();
    return;
  }

  await DeckModel.create({
    name: 'Fibonacci',
    cards: [
      { value: '0' }, { value: '1' }, { value: '2' },
      { value: '3' }, { value: '5' }, { value: '8' },
      { value: '13' }, { value: '21' }, { value: '40' },
      { value: '?' },
    ],
  });

  console.log('Seeded Fibonacci deck.');
  await mongoose.disconnect();
}

seed().catch(console.error);
