import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TasksService } from './tasks.service';
import { Task } from '../schemas/task.schema';
import { Deck } from '../schemas/deck.schema';
import { EventsGateway } from '../events/events.gateway';
import { SocketEvents } from '@poker/shared';

const mockCard = { _id: 'card1', value: '5' };
const mockDeck = { _id: 'deck1', cards: [mockCard] };

const makeTask = (overrides = {}) => ({
  _id: 'task1',
  title: 'Test task',
  roomId: 'room1',
  estimations: [],
  finalEstimation: null,
  ...overrides,
});

describe('TasksService', () => {
  let service: TasksService;
  let taskModel: any;
  let deckModel: any;
  let eventsGateway: any;

  beforeEach(async () => {
    taskModel = {
      find: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      updateOne: jest.fn(),
    };
    deckModel = { findOne: jest.fn() };
    eventsGateway = { emitToRoom: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getModelToken(Task.name), useValue: taskModel },
        { provide: getModelToken(Deck.name), useValue: deckModel },
        { provide: EventsGateway, useValue: eventsGateway },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  describe('findByRoom', () => {
    it('returns tasks mapped to DTOs', async () => {
      const task = makeTask();
      taskModel.find.mockReturnValue({ lean: () => Promise.resolve([task]) });

      const result = await service.findByRoom('room1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('task1');
      expect(result[0].roomId).toBe('room1');
    });
  });

  describe('create', () => {
    it('creates task and emits TASK_CREATED', async () => {
      const task = makeTask();
      taskModel.create.mockResolvedValue({ toObject: () => task });

      const result = await service.create({ title: 'Test task', roomId: 'room1' });

      expect(result.title).toBe('Test task');
      expect(eventsGateway.emitToRoom).toHaveBeenCalledWith(
        'room1', SocketEvents.TASK_CREATED, expect.objectContaining({ title: 'Test task' }),
      );
    });
  });

  describe('invalidateEstimations', () => {
    it('clears estimations and emits ESTIMATIONS_INVALIDATED', async () => {
      const task = makeTask();
      taskModel.findByIdAndUpdate.mockReturnValue({ lean: () => Promise.resolve(task) });

      await service.invalidateEstimations('task1');

      expect(taskModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'task1', { $set: { estimations: [], finalEstimation: null } }, { new: true },
      );
      expect(eventsGateway.emitToRoom).toHaveBeenCalledWith(
        'room1', SocketEvents.ESTIMATIONS_INVALIDATED, expect.objectContaining({ estimations: [] }),
      );
    });
  });

  describe('createFinalEstimation', () => {
    it('sets finalEstimation and emits TASK_ESTIMATED', async () => {
      const task = makeTask({ finalEstimation: mockCard });
      deckModel.findOne.mockReturnValue({ lean: () => Promise.resolve(mockDeck) });
      taskModel.findByIdAndUpdate.mockReturnValue({ lean: () => Promise.resolve(task) });

      const result = await service.createFinalEstimation({ cardId: 'card1', taskId: 'task1' });

      expect(result.finalEstimation?.value).toBe('5');
      expect(eventsGateway.emitToRoom).toHaveBeenCalledWith(
        'room1', SocketEvents.TASK_ESTIMATED,
        expect.objectContaining({ finalEstimation: expect.objectContaining({ value: '5' }) }),
      );
    });

    it('throws when card not found', async () => {
      deckModel.findOne.mockReturnValue({ lean: () => Promise.resolve(null) });
      await expect(service.createFinalEstimation({ cardId: 'bad', taskId: 'task1' }))
        .rejects.toThrow();
    });
  });
});
