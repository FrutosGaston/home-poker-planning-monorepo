import type { Estimation, GuestUser, Room, Task } from './types';

export const SocketEvents = {
  ESTIMATION_CREATED: 'estimations:created',
  TASK_ESTIMATED: 'tasks:estimated',
  TASK_CREATED: 'tasks:created',
  ESTIMATIONS_INVALIDATED: 'tasks:estimations:invalidated',
  ROOM_UPDATED: 'room:updated',
  GUEST_USER_CREATED: 'guest-users:created',
  GUEST_USER_LEFT: 'guest-users:left',
} as const;

export type SocketEventName = typeof SocketEvents[keyof typeof SocketEvents];

export interface ServerToClientEvents {
  [SocketEvents.ESTIMATION_CREATED]: (data: Estimation) => void;
  [SocketEvents.TASK_ESTIMATED]: (data: Task) => void;
  [SocketEvents.TASK_CREATED]: (data: Task) => void;
  [SocketEvents.ESTIMATIONS_INVALIDATED]: (data: Task) => void;
  [SocketEvents.ROOM_UPDATED]: (data: Room) => void;
  [SocketEvents.GUEST_USER_CREATED]: (data: GuestUser) => void;
  [SocketEvents.GUEST_USER_LEFT]: (data: GuestUser) => void;
}

export interface ClientToServerEvents {
  'room:join': (roomId: string) => void;
  'heartbeat': (userId: string) => void;
}
