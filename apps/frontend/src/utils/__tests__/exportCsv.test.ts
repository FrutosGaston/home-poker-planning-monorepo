import { describe, it, expect } from 'vitest';
import { buildCsvContent } from '../exportCsv';
import type { Task, Card } from '../../types';

const makeCard = (value: string): Card => ({ id: `c-${value}`, value });

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 't1',
  roomId: 'r1',
  title: 'My Task',
  description: undefined,
  estimations: [],
  finalEstimation: null,
  ...overrides,
});

describe('buildCsvContent', () => {
  it('returns empty string when no completed tasks', () => {
    expect(buildCsvContent([makeTask()])).toBe('');
  });

  it('includes header row', () => {
    const task = makeTask({ finalEstimation: makeCard('5'), estimations: [] });
    const csv = buildCsvContent([task]);
    expect(csv.split('\n')[0]).toBe('Task,Description,Final Estimation,Votes');
  });

  it('includes task title and final estimation', () => {
    const task = makeTask({ title: 'Login page', finalEstimation: makeCard('8'), estimations: [] });
    const csv = buildCsvContent([task]);
    const row = csv.split('\n')[1];
    expect(row).toContain('"Login page"');
    expect(row).toContain('8');
  });

  it('includes vote count', () => {
    const task = makeTask({
      finalEstimation: makeCard('5'),
      estimations: [
        { id: 'e1', card: makeCard('5'), guestUserId: 'u1', active: true },
        { id: 'e2', card: makeCard('3'), guestUserId: 'u2', active: true },
      ],
    });
    const csv = buildCsvContent([task]);
    expect(csv.split('\n')[1]).toContain('2');
  });

  it('escapes quotes in title', () => {
    const task = makeTask({ title: 'Fix "bug"', finalEstimation: makeCard('3'), estimations: [] });
    const csv = buildCsvContent([task]);
    expect(csv).toContain('"Fix ""bug"""');
  });

  it('includes description when present', () => {
    const task = makeTask({
      title: 'Task',
      description: 'Some details',
      finalEstimation: makeCard('5'),
      estimations: [],
    });
    const csv = buildCsvContent([task]);
    expect(csv).toContain('"Some details"');
  });

  it('only includes completed tasks', () => {
    const pending = makeTask({ title: 'Pending', finalEstimation: null });
    const done = makeTask({ id: 't2', title: 'Done', finalEstimation: makeCard('5'), estimations: [] });
    const csv = buildCsvContent([pending, done]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2); // header + 1 row
    expect(csv).not.toContain('Pending');
    expect(csv).toContain('Done');
  });
});
