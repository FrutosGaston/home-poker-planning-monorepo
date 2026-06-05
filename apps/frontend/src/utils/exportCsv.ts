import type { Task } from '../types';

export function buildCsvContent(tasks: Task[]): string {
  const completed = tasks.filter((t) => t.finalEstimation);
  if (!completed.length) return '';

  const rows = [
    ['Task', 'Description', 'Final Estimation', 'Votes'],
    ...completed.map((t) => [
      `"${t.title.replace(/"/g, '""')}"`,
      `"${(t.description ?? '').replace(/"/g, '""')}"`,
      t.finalEstimation?.value ?? '',
      String(t.estimations.length),
    ]),
  ];
  return rows.map((r) => r.join(',')).join('\n');
}
