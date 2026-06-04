import api from './api';
import type { Task } from '../types';

export const taskService = {
  getByRoom: (roomId: number) =>
    api.get<Task[]>('/api/v1/tasks', { params: { roomId } }).then(r => r.data),

  create: (task: { title: string; roomId: number }) =>
    api.post<Task>('/api/v1/tasks', task).then(r => r.data),

  update: (taskId: number, data: Partial<Task>) =>
    api.patch<Task>(`/api/v1/tasks/${taskId}`, data).then(r => r.data),

  estimate: (estimation: { cardId: number; taskId: number; guestUserId: number }) =>
    api.post('/api/v1/tasks/estimations', estimation).then(r => r.data),

  estimateFinal: (estimation: { cardId: number; taskId: number }) =>
    api.post('/api/v1/tasks/final-estimations', estimation).then(r => r.data),

  invalidateEstimations: (taskId: number) =>
    api.delete(`/api/v1/tasks/${taskId}/estimations`).then(r => r.data),
};
