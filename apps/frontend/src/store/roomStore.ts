import { create } from 'zustand';
import type { Room, Task, GuestUser, Estimation } from '../types';

interface RoomState {
  room: Room | null;
  tasks: Task[];
  users: GuestUser[];
  currentTask: Task | null;
  currentUser: GuestUser | null;

  setRoom: (room: Room) => void;
  setTasks: (tasks: Task[]) => void;
  setUsers: (users: GuestUser[]) => void;
  setCurrentTask: (task: Task | null) => void;
  setCurrentUser: (user: GuestUser) => void;

  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  addUser: (user: GuestUser) => void;
  addEstimation: (estimation: Estimation) => void;
  clearEstimations: (taskId: number) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  tasks: [],
  users: [],
  currentTask: null,
  currentUser: null,

  setRoom: (room) => set({ room }),
  setTasks: (tasks) => set({ tasks }),
  setUsers: (users) => set({ users }),
  setCurrentTask: (task) => set({ currentTask: task }),
  setCurrentUser: (user) => set({ currentUser: user }),

  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),

  updateTask: (task) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === task.id ? task : t)),
      currentTask: s.currentTask?.id === task.id ? task : s.currentTask,
    })),

  addUser: (user) =>
    set((s) => ({
      users: s.users.find((u) => u.id === user.id) ? s.users : [...s.users, user],
    })),

  addEstimation: (estimation) =>
    set((s) => {
      if (!s.currentTask) return s;
      const already = s.currentTask.estimations.find((e) => e.id === estimation.id);
      if (already) return s;
      const updated = {
        ...s.currentTask,
        estimations: [...s.currentTask.estimations, estimation],
      };
      return {
        currentTask: updated,
        tasks: s.tasks.map((t) => (t.id === updated.id ? updated : t)),
      };
    }),

  clearEstimations: (taskId) =>
    set((s) => {
      const updated = s.tasks.map((t) =>
        t.id === taskId ? { ...t, estimations: [], estimationId: undefined, estimation: undefined } : t
      );
      return {
        tasks: updated,
        currentTask:
          s.currentTask?.id === taskId
            ? { ...s.currentTask, estimations: [], estimationId: undefined, estimation: undefined }
            : s.currentTask,
      };
    }),
}));
