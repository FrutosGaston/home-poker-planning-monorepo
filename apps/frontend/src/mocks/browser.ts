import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { mockCurrentUser } from './data';

export const worker = setupWorker(...handlers);

// Pre-seed logged user so the room skips the login form in dev
localStorage.setItem(`usr-${mockCurrentUser.roomId}`, JSON.stringify(mockCurrentUser));
