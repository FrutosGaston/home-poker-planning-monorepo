import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EstimationMetrics from '../EstimationMetrics';
import type { Task, Card, Estimation } from '../../../types';

const makeCard = (value: string): Card => ({ id: `card-${value}`, value });

const makeEstimation = (value: string, userId: string): Estimation => ({
  id: `est-${userId}`,
  card: makeCard(value),
  guestUserId: userId,
  active: true,
});

const makeTask = (estimations: Estimation[]): Task => ({
  id: 'task1',
  roomId: 'room1',
  title: 'Test task',
  estimations,
  finalEstimation: null,
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => opts?.votes ? `${opts.votes} votes` : key,
  }),
}));

describe('EstimationMetrics', () => {
  it('renders nothing when no estimations', () => {
    const { container } = render(<EstimationMetrics task={makeTask([])} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows vote counts correctly', () => {
    const task = makeTask([
      makeEstimation('5', 'u1'),
      makeEstimation('5', 'u2'),
      makeEstimation('8', 'u3'),
    ]);
    render(<EstimationMetrics task={task} />);
    expect(screen.getByText(/2 votes/)).toBeInTheDocument();
    expect(screen.getByText(/1 votes/)).toBeInTheDocument();
  });

  it('shows average chip for numeric values', () => {
    const task = makeTask([
      makeEstimation('3', 'u1'),
      makeEstimation('5', 'u2'),
      makeEstimation('7', 'u3'),
    ]);
    render(<EstimationMetrics task={task} />);
    expect(screen.getByText('avg 5')).toBeInTheDocument();
  });

  it('shows median chip for numeric values', () => {
    const task = makeTask([
      makeEstimation('2', 'u1'),
      makeEstimation('5', 'u2'),
      makeEstimation('8', 'u3'),
    ]);
    render(<EstimationMetrics task={task} />);
    expect(screen.getByText('median 5')).toBeInTheDocument();
  });

  it('excludes non-numeric values from average and median', () => {
    const task = makeTask([
      makeEstimation('5', 'u1'),
      makeEstimation('?', 'u2'),
      makeEstimation('☕', 'u3'),
    ]);
    render(<EstimationMetrics task={task} />);
    expect(screen.getByText('avg 5')).toBeInTheDocument();
    expect(screen.getByText('median 5')).toBeInTheDocument();
  });

  it('handles even number of values for median', () => {
    const task = makeTask([
      makeEstimation('4', 'u1'),
      makeEstimation('6', 'u2'),
    ]);
    render(<EstimationMetrics task={task} />);
    expect(screen.getByText('median 5')).toBeInTheDocument();
  });

  it('shows no avg/median when all values are non-numeric', () => {
    const task = makeTask([
      makeEstimation('?', 'u1'),
      makeEstimation('☕', 'u2'),
    ]);
    render(<EstimationMetrics task={task} />);
    expect(screen.queryByText(/avg/)).not.toBeInTheDocument();
    expect(screen.queryByText(/median/)).not.toBeInTheDocument();
  });
});
