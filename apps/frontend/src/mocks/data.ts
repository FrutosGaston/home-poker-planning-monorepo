import type { Card, Deck, Estimation, GuestUser, Room, Task } from '../types';

export const mockCards: Card[] = [
  { id: 'c1', value: '0' },
  { id: 'c2', value: '1' },
  { id: 'c3', value: '2' },
  { id: 'c4', value: '3' },
  { id: 'c5', value: '5' },
  { id: 'c6', value: '8' },
  { id: 'c7', value: '13' },
  { id: 'c8', value: '21' },
  { id: 'c9', value: '40' },
  { id: 'c10', value: '?' },
];

export const mockDeck: Deck = { id: 'd1', name: 'Fibonacci', cards: mockCards };

export const mockRoom: Room = {
  id: 'r1',
  uuid: 'mock-room-uuid-1234',
  deckId: 'd1',
  deck: mockDeck,
  selectedTaskId: 't1',
  title: 'Sprint 42 Planning',
  description: 'Mock room for local development',
  autoReveal: true,
};

export const mockTasks: Task[] = [
  { id: 't1', roomId: 'r1', title: 'Set up authentication', estimations: [] as Estimation[], finalEstimation: null },
  { id: 't2', roomId: 'r1', title: 'Design database schema', estimations: [] as Estimation[], finalEstimation: null },
  { id: 't3', roomId: 'r1', title: 'Build REST API endpoints', estimations: [] as Estimation[], finalEstimation: null },
];

export const mockCurrentUser: GuestUser = { id: 'u1', name: 'Gaston', roomId: 'r1', spectator: false };

export const mockUsers: GuestUser[] = [
  mockCurrentUser,
  { id: 'u2', name: 'Alice', roomId: 'r1', spectator: false },
  { id: 'u3', name: 'Bob', roomId: 'r1', spectator: false },
  { id: 'u4', name: 'Charlie', roomId: 'r1', spectator: true },
];

let nextId = 100;
export const nextMockId = () => `mock-${nextId++}`;

export const state = {
  room: { ...mockRoom },
  tasks: mockTasks.map(t => ({ ...t, estimations: [] as Estimation[] })),
  users: [...mockUsers],
};
