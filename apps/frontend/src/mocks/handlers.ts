import { http, HttpResponse } from 'msw';
import { SocketEvents } from '@poker/shared';
import { state, mockDeck } from './data';
import { stompBus } from './stompBus';

const API = 'http://localhost:8080';

export const handlers = [
  // GET /api/v1/decks
  http.get(`${API}/api/v1/decks`, () => {
    return HttpResponse.json([mockDeck]);
  }),

  // GET /api/v1/rooms/:uuid
  http.get(`${API}/api/v1/rooms/:uuid`, () => {
    return HttpResponse.json(state.room);
  }),

  // POST /api/v1/rooms
  http.post(`${API}/api/v1/rooms`, async ({ request }) => {
    const body = await request.json() as { title: string; description?: string; deckId: number };
    state.room = { ...state.room, title: body.title, description: body.description };
    return HttpResponse.json(state.room, { status: 201 });
  }),

  // PATCH /api/v1/rooms/:id
  http.patch(`${API}/api/v1/rooms/:id`, async ({ request }) => {
    const body = await request.json() as { selectedTaskId: number };
    state.room.selectedTaskId = body.selectedTaskId;
    return HttpResponse.json(state.room);
  }),

  // GET /api/v1/tasks?roomId=
  http.get(`${API}/api/v1/tasks`, () => {
    return HttpResponse.json(state.tasks);
  }),

  // POST /api/v1/tasks
  http.post(`${API}/api/v1/tasks`, async ({ request }) => {
    const body = await request.json() as { title: string; roomId: number };
    const task = { id: state.nextTaskId++, roomId: body.roomId, title: body.title, estimations: [] };
    state.tasks.push(task);
    stompBus.publish(SocketEvents.TASK_CREATED, task);
    return HttpResponse.json(task, { status: 201 });
  }),

  // PATCH /api/v1/tasks/:id
  http.patch(`${API}/api/v1/tasks/:id`, async ({ params, request }) => {
    const body = await request.json() as Record<string, unknown>;
    const task = state.tasks.find(t => t.id === Number(params.id));
    if (!task) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    Object.assign(task, body);
    return HttpResponse.json(task);
  }),

  // POST /api/v1/tasks/estimations
  http.post(`${API}/api/v1/tasks/estimations`, async ({ request }) => {
    const body = await request.json() as { cardId: number; taskId: number; guestUserId: number };
    const task = state.tasks.find(t => t.id === body.taskId);
    if (!task) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    const card = mockDeck.cards.find(c => c.id === body.cardId)!;
    // Replace existing estimation from same user
    task.estimations = task.estimations.filter(e => e.guestUserId !== body.guestUserId);
    const estimation = { id: state.nextEstimationId++, card, cardId: body.cardId, taskId: body.taskId, guestUserId: body.guestUserId, active: true };
    task.estimations.push(estimation);
    stompBus.publish(SocketEvents.ESTIMATION_CREATED, estimation);
    return HttpResponse.json(estimation, { status: 201 });
  }),

  // POST /api/v1/tasks/final-estimations
  http.post(`${API}/api/v1/tasks/final-estimations`, async ({ request }) => {
    const body = await request.json() as { cardId: number; taskId: number };
    const task = state.tasks.find(t => t.id === body.taskId);
    if (!task) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    const card = mockDeck.cards.find(c => c.id === body.cardId)!;
    const estimation = { id: state.nextEstimationId++, card, cardId: body.cardId, taskId: body.taskId, guestUserId: 0, active: true };
    task.estimationId = estimation.id;
    task.estimation = estimation;
    stompBus.publish(SocketEvents.TASK_ESTIMATED, task);
    return HttpResponse.json(task);
  }),

  // DELETE /api/v1/tasks/:id/estimations
  http.delete(`${API}/api/v1/tasks/:id/estimations`, ({ params }) => {
    const task = state.tasks.find(t => t.id === Number(params.id));
    if (!task) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    task.estimations = [];
    task.estimationId = undefined;
    task.estimation = undefined;
    stompBus.publish(SocketEvents.ESTIMATIONS_INVALIDATED, task);
    return HttpResponse.json(task);
  }),

  // GET /api/v1/guest-users?roomId=
  http.get(`${API}/api/v1/guest-users`, () => {
    return HttpResponse.json(state.users);
  }),

  // POST /api/v1/guest-users
  http.post(`${API}/api/v1/guest-users`, async ({ request }) => {
    const body = await request.json() as { name: string; roomId: number; spectator: boolean };
    const user = { id: state.nextUserId++, name: body.name, roomId: body.roomId, spectator: body.spectator };
    state.users.push(user);
    stompBus.publish(SocketEvents.GUEST_USER_CREATED, user);
    return HttpResponse.json(user, { status: 201 });
  }),
];
