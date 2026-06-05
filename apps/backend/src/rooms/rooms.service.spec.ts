jest.mock('uuid', () => ({ v4: () => 'mock-uuid' }));
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { Room } from '../schemas/room.schema';
import { Deck } from '../schemas/deck.schema';
import { EventsGateway } from '../events/events.gateway';
import { SocketEvents } from '@poker/shared';

const mockDeck = {
  _id: 'deck1',
  name: 'Fibonacci',
  cards: [{ _id: 'c1', value: '5' }],
};

const makeRoom = (overrides = {}) => ({
  _id: 'room1',
  uuid: 'test-uuid',
  title: 'Test Room',
  description: undefined,
  deckId: 'deck1',
  selectedTaskId: null,
  autoReveal: true,
  ...overrides,
});

describe('RoomsService', () => {
  let service: RoomsService;
  let roomModel: any;
  let deckModel: any;
  let eventsGateway: any;

  beforeEach(async () => {
    roomModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    deckModel = { findById: jest.fn() };
    eventsGateway = { emitToRoom: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: getModelToken(Room.name), useValue: roomModel },
        { provide: getModelToken(Deck.name), useValue: deckModel },
        { provide: EventsGateway, useValue: eventsGateway },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
  });

  describe('create', () => {
    it('creates a room and returns DTO with deck', async () => {
      deckModel.findById.mockReturnValue({ lean: () => Promise.resolve(mockDeck) });
      roomModel.create.mockResolvedValue(makeRoom());

      const result = await service.create({ title: 'Test Room', deckId: 'deck1' });

      expect(result.title).toBe('Test Room');
      expect(result.deck.name).toBe('Fibonacci');
      expect(result.deck.cards).toHaveLength(1);
      expect(result.autoReveal).toBe(true);
    });

    it('throws NotFoundException when deck not found', async () => {
      deckModel.findById.mockReturnValue({ lean: () => Promise.resolve(null) });

      await expect(service.create({ title: 'Test', deckId: 'bad' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('findByUUID', () => {
    it('returns room DTO', async () => {
      roomModel.findOne.mockReturnValue({ lean: () => Promise.resolve(makeRoom()) });
      deckModel.findById.mockReturnValue({ lean: () => Promise.resolve(mockDeck) });

      const result = await service.findByUUID('test-uuid');

      expect(result.uuid).toBe('test-uuid');
      expect(result.autoReveal).toBe(true);
    });

    it('throws NotFoundException when room not found', async () => {
      roomModel.findOne.mockReturnValue({ lean: () => Promise.resolve(null) });

      await expect(service.findByUUID('bad-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates selectedTaskId and emits ROOM_UPDATED', async () => {
      roomModel.findByIdAndUpdate.mockReturnValue({ lean: () => Promise.resolve(makeRoom({ selectedTaskId: 'task1' })) });
      deckModel.findById.mockReturnValue({ lean: () => Promise.resolve(mockDeck) });

      await service.update('room1', { selectedTaskId: 'task1' });

      expect(eventsGateway.emitToRoom).toHaveBeenCalledWith(
        'room1', SocketEvents.ROOM_UPDATED, expect.objectContaining({ selectedTaskId: 'task1' }),
      );
    });

    it('updates autoReveal and broadcasts to all clients', async () => {
      roomModel.findByIdAndUpdate.mockReturnValue({ lean: () => Promise.resolve(makeRoom({ autoReveal: false })) });
      deckModel.findById.mockReturnValue({ lean: () => Promise.resolve(mockDeck) });

      const result = await service.update('room1', { autoReveal: false });

      expect(result.autoReveal).toBe(false);
      expect(eventsGateway.emitToRoom).toHaveBeenCalledWith(
        'room1', SocketEvents.ROOM_UPDATED, expect.objectContaining({ autoReveal: false }),
      );
    });

    it('throws NotFoundException when room not found', async () => {
      roomModel.findByIdAndUpdate.mockReturnValue({ lean: () => Promise.resolve(null) });

      await expect(service.update('bad', {})).rejects.toThrow(NotFoundException);
    });
  });
});
