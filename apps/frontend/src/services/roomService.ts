import api from './api';
import type { Room } from '../types';

export const roomService = {
  create: (room: { title: string; description?: string; deckId: number; guestUserName: string }) =>
    api.post<Room>('/api/v1/rooms', room).then(r => r.data),

  getByUUID: (uuid: string) =>
    api.get<Room>(`/api/v1/rooms/${uuid}`).then(r => r.data),

  update: (roomId: number, data: { selectedTaskId: number }) =>
    api.patch<Room>(`/api/v1/rooms/${roomId}`, data).then(r => r.data),
};
