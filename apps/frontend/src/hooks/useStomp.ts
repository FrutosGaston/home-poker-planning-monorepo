import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';

const WS_URL = import.meta.env.VITE_WS_URL;
const IS_DEV = import.meta.env.DEV;

let client: Client | null = null;

const getClient = (): Client => {
  if (!client) {
    client = new Client({
      brokerURL: `${WS_URL}/ws`,
      connectHeaders: { login: 'guest', passcode: 'guest' },
      heartbeatOutgoing: 20000,
      heartbeatIncoming: 0,
      reconnectDelay: 200,
    });
    client.activate();
  }
  return client;
};

export const useStomp = <T>(
  topic: string | null,
  onMessage: (data: T) => void
) => {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!topic) return;

    // In dev mode use the in-browser stompBus instead of a real WebSocket
    if (IS_DEV) {
      let unsubscribe: (() => void) | undefined;
      import('../mocks/stompBus').then(({ stompBus }) => {
        unsubscribe = stompBus.subscribe(topic, (data) => {
          onMessageRef.current(data as T);
        });
      });
      return () => unsubscribe?.();
    }

    // Production: real STOMP over WebSocket
    const stompClient = getClient();
    let sub: ReturnType<typeof stompClient.subscribe> | null = null;

    const subscribe = () => {
      sub = stompClient.subscribe(topic, (frame) => {
        try {
          onMessageRef.current(JSON.parse(frame.body) as T);
        } catch {
          // ignore malformed frames
        }
      });
    };

    if (stompClient.connected) {
      subscribe();
    } else {
      const originalOnConnect = stompClient.onConnect;
      stompClient.onConnect = (frame) => {
        originalOnConnect?.call(stompClient, frame);
        subscribe();
      };
    }

    return () => sub?.unsubscribe();
  }, [topic]);
};
