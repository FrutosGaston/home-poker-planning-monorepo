import { http, HttpResponse } from 'msw';
import { SocketEvents } from '@poker/shared';
import type { Estimation } from '../types';
import { state, mockDeck, nextMockId } from './data';
import { stompBus } from './stompBus';

const API = 'http://localhost:8080';

export const handlers = [
  http.get(`${API}/api/v1/decks`, () => HttpResponse.json([mockDeck])),

  http.get(`${API}/api/v1/rooms/:uuid`, () => HttpResponse.json(state.room)),

  http.post(`${API}/api/v1/rooms`, async ({ request }) => {
    const body = await request.json() as { title: string; description?: string; deckId: string };
    state.room = { ...state.room, title: body.title, description: body.description };
    return HttpResponse.json(state.room, { status: 201 });
  }),

  http.patch(`${API}/api/v1/rooms/:id`, async ({ request }) => {
    const body = await request.json() as { selectedTaskId: string };
    state.room.selectedTaskId = body.selectedTaskId;
    return HttpResponse.json(state.room);
  }),

  http.get(`${API}/api/v1/tasks`, () => HttpResponse.json(state.tasks)),

  http.post(`${API}/api/v1/tasks`, async ({ request }) => {
    const body = await request.json() as { title: string; roomId: string };
    const task = { id: nextMockId(), roomId: body.roomId, title: body.title, estimations: [], finalEstimation: null };
    state.tasks.push(task);
    stompBus.publish(SocketEvents.TASK_CREATED, task);
    return HttpResponse.json(task, { status: 201 });
  }),

  http.patch(`${API}/api/v1/tasks/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const task = state.tasks.find(t => t.id === params.id);
    if (!task) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    Object.assign(task, body);
    return HttpResponse.json(task);
  }),

  http.post(`${API}/api/v1/tasks/estimations`, async ({ request }) => {
    const body = await request.json() as { cardId: string; taskId: string; guestUserId: string };
    const task = state.tasks.find(t => t.id === body.taskId);
    if (!task) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    const card = mockDeck.cards.find(c => c.id === body.cardId)!;
    task.estimations = (task.estimations as Estimation[]).filter(e => e.guestUserId !== body.guestUserId);
    const estimation: Estimation = { id: nextMockId(), card, guestUserId: body.guestUserId, active: true };
    (task.estimations as Estimation[]).push(estimation);
    stompBus.publish(SocketEvents.ESTIMATION_CREATED, estimation);
    return HttpResponse.json(estimation, { status: 201 });
  }),

  http.post(`${API}/api/v1/tasks/final-estimations`, async ({ request }) => {
    const body = await request.json() as { cardId: string; taskId: string };
    const task = state.tasks.find(t => t.id === body.taskId);
    if (!task) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    const card = mockDeck.cards.find(c => c.id === body.cardId)!;
    task.finalEstimation = card;
    stompBus.publish(SocketEvents.TASK_ESTIMATED, task);
    return HttpResponse.json(task);
  }),

  http.delete(`${API}/api/v1/tasks/:id/estimations`, ({ params }) => {
    const task = state.tasks.find(t => t.id === params.id);
    if (!task) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    task.estimations = [];
    task.finalEstimation = null;
    stompBus.publish(SocketEvents.ESTIMATIONS_INVALIDATED, task);
    return HttpResponse.json(task);
  }),

  http.get(`${API}/api/v1/guest-users`, () => HttpResponse.json(state.users)),

  http.post(`${API}/api/v1/guest-users`, async ({ request }) => {
    const body = await request.json() as { name: string; roomId: string; spectator: boolean };
    const user = { id: nextMockId(), name: body.name, roomId: body.roomId, spectator: body.spectator };
    state.users.push(user);
    stompBus.publish(SocketEvents.GUEST_USER_CREATED, user);
    return HttpResponse.json(user, { status: 201 });
  }),
];
