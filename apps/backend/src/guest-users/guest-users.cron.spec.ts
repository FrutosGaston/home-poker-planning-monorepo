import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { GuestUsersCron } from './guest-users.cron';
import { GuestUser } from '../schemas/guest-user.schema';
import { EventsGateway } from '../events/events.gateway';
import { SocketEvents } from '@poker/shared';

const makeUser = (overrides = {}) => ({
  _id: 'user1',
  name: 'Test User',
  roomId: 'room1',
  spectator: false,
  inactive: false,
  lastSeen: new Date(),
  ...overrides,
});

describe('GuestUsersCron', () => {
  let cron: GuestUsersCron;
  let guestUserModel: any;
  let eventsGateway: any;

  beforeEach(async () => {
    guestUserModel = {
      find: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };
    eventsGateway = { emitToRoom: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuestUsersCron,
        { provide: getModelToken(GuestUser.name), useValue: guestUserModel },
        { provide: EventsGateway, useValue: eventsGateway },
      ],
    }).compile();

    cron = module.get<GuestUsersCron>(GuestUsersCron);
  });

  describe('checkInactiveUsers', () => {
    it('deletes users inactive for >5 min and emits GUEST_USER_LEFT', async () => {
      const staleUser = makeUser({ lastSeen: new Date(Date.now() - 10 * 60_000) });

      guestUserModel.find
        .mockReturnValueOnce({ lean: () => Promise.resolve([staleUser]) })
        .mockReturnValueOnce({ lean: () => Promise.resolve([]) });
      guestUserModel.findByIdAndDelete.mockResolvedValue({});

      await cron.checkInactiveUsers();

      expect(guestUserModel.findByIdAndDelete).toHaveBeenCalledWith('user1');
      expect(eventsGateway.emitToRoom).toHaveBeenCalledWith(
        'room1', SocketEvents.GUEST_USER_LEFT,
        expect.objectContaining({ id: 'user1', name: 'Test User' }),
      );
    });

    it('marks users inactive after 60s without heartbeat', async () => {
      const slightlyStale = makeUser({ lastSeen: new Date(Date.now() - 90_000), inactive: false });

      guestUserModel.find
        .mockReturnValueOnce({ lean: () => Promise.resolve([]) })
        .mockReturnValueOnce({ lean: () => Promise.resolve([slightlyStale]) });
      guestUserModel.findByIdAndUpdate.mockResolvedValue({});

      await cron.checkInactiveUsers();

      expect(guestUserModel.findByIdAndUpdate).toHaveBeenCalledWith('user1', { inactive: true });
      expect(eventsGateway.emitToRoom).toHaveBeenCalledWith(
        'room1', SocketEvents.GUEST_USER_CREATED,
        expect.objectContaining({ inactive: true }),
      );
    });

    it('does nothing when no stale users', async () => {
      guestUserModel.find
        .mockReturnValueOnce({ lean: () => Promise.resolve([]) })
        .mockReturnValueOnce({ lean: () => Promise.resolve([]) });

      await cron.checkInactiveUsers();

      expect(eventsGateway.emitToRoom).not.toHaveBeenCalled();
    });

    it('deletes users with missing lastSeen', async () => {
      const noLastSeen = makeUser({ lastSeen: undefined });

      guestUserModel.find
        .mockReturnValueOnce({ lean: () => Promise.resolve([noLastSeen]) })
        .mockReturnValueOnce({ lean: () => Promise.resolve([]) });
      guestUserModel.findByIdAndDelete.mockResolvedValue({});

      await cron.checkInactiveUsers();

      expect(guestUserModel.findByIdAndDelete).toHaveBeenCalledWith('user1');
    });
  });
});
