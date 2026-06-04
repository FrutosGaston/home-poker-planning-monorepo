import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import type { ServerToClientEvents } from '@poker/shared';

const IS_MOCK = import.meta.env.DEV && import.meta.env.VITE_MOCK === 'true';
const BACKEND_URL = import.meta.env.VITE_API_URL;
const HEARTBEAT_INTERVAL = 30_000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let socket: any = null;

const getSocket = () => {
  if (!socket) {
    socket = io(BACKEND_URL, { transports: ['websocket'] });
  }
  return socket;
};

export const useJoinRoom = (roomId: string | null) => {
  useEffect(() => {
    if (!roomId || IS_MOCK) return;
    const s = getSocket();
    const join = () => s.emit('room:join', roomId);
    if (s.connected) {
      join();
    } else {
      s.once('connect', join);
    }
    return () => s.off('connect', join);
  }, [roomId]);
};

export const useHeartbeat = (userId: string | null) => {
  useEffect(() => {
    if (!userId || IS_MOCK) return;
    const s = getSocket();
    const ping = () => s.emit('heartbeat', userId);
    ping(); // immediate on mount
    const interval = setInterval(ping, HEARTBEAT_INTERVAL);
    return () => clearInterval(interval);
  }, [userId]);
};

export const useSocket = <K extends keyof ServerToClientEvents>(
  event: K | null,
  onMessage: (data: Parameters<ServerToClientEvents[K]>[0]) => void,
) => {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!event) return;

    if (IS_MOCK) {
      let unsubscribe: (() => void) | undefined;
      import('../mocks/stompBus').then(({ stompBus }) => {
        unsubscribe = stompBus.subscribe(event as string, (data) => {
          onMessageRef.current(data as Parameters<ServerToClientEvents[K]>[0]);
        });
      });
      return () => unsubscribe?.();
    }

    const s = getSocket();
    const handler = (data: Parameters<ServerToClientEvents[K]>[0]) => {
      onMessageRef.current(data);
    };
    s.on(event, handler);
    return () => s.off(event, handler);
  }, [event]);
};
