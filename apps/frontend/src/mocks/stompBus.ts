// In-browser event bus that simulates STOMP topic broadcasts in dev mode.
// Handlers publish to it; useStomp subscribes from it when MSW is active.
const bus = new EventTarget();

export const stompBus = {
  publish: (topic: string, data: unknown) => {
    bus.dispatchEvent(new CustomEvent(topic, { detail: data }));
  },
  subscribe: (topic: string, callback: (data: unknown) => void) => {
    const handler = (e: Event) => callback((e as CustomEvent).detail);
    bus.addEventListener(topic, handler);
    return () => bus.removeEventListener(topic, handler);
  },
};
