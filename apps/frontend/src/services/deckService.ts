import api from './api';
import type { Deck } from '../types';

let cache: Deck[] | null = null;

export const deckService = {
  findDecks: async (): Promise<Deck[]> => {
    if (cache) return cache;
    const data = await api.get<Deck[]>('/api/v1/decks').then(r => r.data);
    cache = data;
    return data;
  },
};
