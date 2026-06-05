import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { ServerToClientEvents } from '@poker/shared';

const IS_MOCK = import.meta.env.DEV && import.meta.env.VITE_MOCK === 'true';
const BACKEND_URL = import.meta.env.VITE_API_URL;
const HEARTBEAT_INTERVAL = 30_000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let socket: any = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
};

export const useConnectionStatus = () => {
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    if (IS_MOCK) return;
    const s = getSocket();
    setConnected(s.connected);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, []);

  return connected;
};

export const useJoinRoom = (roomId: string | null) => {
  useEffect(() => {
    if (!roomId || IS_MOCK) return;
    const s = getSocket();
    // Join on connect and reconnect
    const join = () => s.emit('room:join', roomId);
    if (s.connected) join();
    s.on('connect', join);
    return () => s.off('connect', join);
  }, [roomId]);
};

export const useHeartbeat = (userId: string | null) => {
  useEffect(() => {
    if (!userId || IS_MOCK) return;
    const s = getSocket();
    const ping = () => s.emit('heartbeat', userId);
    ping();
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
