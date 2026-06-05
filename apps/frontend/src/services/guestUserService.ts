import api from './api';
import type { GuestUser } from '../types';

export const guestUserService = {
  create: (user: { name: string; roomId: string; spectator: boolean }) =>
    api.post<GuestUser>('/api/v1/guest-users', user).then(r => r.data),

  findByRoom: (roomId: string) =>
    api.get<GuestUser[]>('/api/v1/guest-users', { params: { roomId } }).then(r => r.data),

  toggleSpectator: (id: string) =>
    api.patch<GuestUser>(`/api/v1/guest-users/${id}/toggle-spectator`).then(r => r.data),

  getLoggedUser: (roomId: string): GuestUser | null => {
    const stored = localStorage.getItem(`usr-${roomId}`);
    return stored ? JSON.parse(stored) : null;
  },

  saveLoggedUser: (user: GuestUser) =>
    localStorage.setItem(`usr-${user.roomId}`, JSON.stringify(user)),
};
