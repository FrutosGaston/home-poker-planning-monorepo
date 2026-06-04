import type { Card, Deck, GuestUser, Room, Task } from '../types';

export const mockCards: Card[] = [
  { id: 1, value: '0', deckId: 1 },
  { id: 2, value: '1', deckId: 1 },
  { id: 3, value: '2', deckId: 1 },
  { id: 4, value: '3', deckId: 1 },
  { id: 5, value: '5', deckId: 1 },
  { id: 6, value: '8', deckId: 1 },
  { id: 7, value: '13', deckId: 1 },
  { id: 8, value: '21', deckId: 1 },
  { id: 9, value: '40', deckId: 1 },
  { id: 10, value: '?', deckId: 1 },
];

export const mockDeck: Deck = { id: 1, name: 'Fibonacci', cards: mockCards };

export const mockRoom: Room = {
  id: 1,
  uuid: 'mock-room-uuid-1234',
  deckId: 1,
  deck: mockDeck,
  selectedTaskId: 1,
  title: 'Sprint 42 Planning',
  description: 'Mock room for local development',
};

export const mockTasks: Task[] = [
  { id: 1, roomId: 1, title: 'Set up authentication', estimations: [] },
  { id: 2, roomId: 1, title: 'Design database schema', estimations: [] },
  { id: 3, roomId: 1, title: 'Build REST API endpoints', estimations: [] },
];

export const mockCurrentUser: GuestUser = { id: 1, name: 'Gaston', roomId: 1, spectator: false };

export const mockUsers: GuestUser[] = [
  mockCurrentUser,
  { id: 2, name: 'Alice', roomId: 1, spectator: false },
  { id: 3, name: 'Bob', roomId: 1, spectator: false },
  { id: 4, name: 'Charlie', roomId: 1, spectator: true },
];

// Mutable state for handlers to mutate during a session
export const state = {
  room: { ...mockRoom },
  tasks: mockTasks.map(t => ({ ...t })),
  users: mockUsers.map(u => ({ ...u })),
  nextUserId: 20,
  nextTaskId: 10,
  nextEstimationId: 100,
};
