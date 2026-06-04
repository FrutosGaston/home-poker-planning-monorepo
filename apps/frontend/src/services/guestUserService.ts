import api from './api';
import type { GuestUser } from '../types';

export const guestUserService = {
  create: (user: { name: string; roomId: number; spectator: boolean }) =>
    api.post<GuestUser>('/api/v1/guest-users', user).then(r => r.data),

  findByRoom: (roomId: number) =>
    api.get<GuestUser[]>('/api/v1/guest-users', { params: { roomId } }).then(r => r.data),

  getLoggedUser: (roomId: number): GuestUser | null => {
    const stored = localStorage.getItem(`usr-${roomId}`);
    return stored ? JSON.parse(stored) : null;
  },

  saveLoggedUser: (user: GuestUser) =>
    localStorage.setItem(`usr-${user.roomId}`, JSON.stringify(user)),
};
