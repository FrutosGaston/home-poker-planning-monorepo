import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import type { ServerToClientEvents } from '@poker/shared';

const IS_DEV = import.meta.env.DEV;
const BACKEND_URL = import.meta.env.VITE_API_URL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let socket: any = null;

const getSocket = () => {
  if (!socket) {
    socket = io(BACKEND_URL, { transports: ['websocket'] });
  }
  return socket;
};

export const useSocket = <K extends keyof ServerToClientEvents>(
  event: K | null,
  roomId: number | null,
  onMessage: (data: Parameters<ServerToClientEvents[K]>[0]) => void,
) => {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!event) return;

    if (IS_DEV) {
      let unsubscribe: (() => void) | undefined;
      import('../mocks/stompBus').then(({ stompBus }) => {
        unsubscribe = stompBus.subscribe(event as string, (data) => {
          onMessageRef.current(data as Parameters<ServerToClientEvents[K]>[0]);
        });
      });
      return () => unsubscribe?.();
    }

    const s = getSocket();
    if (roomId !== null) s.emit('room:join', roomId);

    const handler = (data: Parameters<ServerToClientEvents[K]>[0]) => {
      onMessageRef.current(data);
    };
    s.on(event, handler);
    return () => s.off(event, handler);
  }, [event, roomId]);
};
