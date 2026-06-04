import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, LinearProgress, Typography } from '@mui/material';
import type { Task } from '../../types';

interface Props {
  task: Task;
}

export default function EstimationMetrics({ task }: Props) {
  const { t } = useTranslation();

  const metrics = useMemo(() => {
    const counts: Record<string, { value: string; count: number }> = {};
    task.estimations.forEach((e) => {
      const val = e.card.value;
      if (!counts[val]) counts[val] = { value: val, count: 0 };
      counts[val].count++;
    });
    const total = task.estimations.length;
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .map((m) => ({ ...m, pct: total ? Math.round((m.count / total) * 100) : 0 }));
  }, [task.estimations]);

  if (!metrics.length) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }} gutterBottom>
        {t('planning.room.metrics.title')}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {metrics.map((m) => (
          <Box key={m.value}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Chip label={m.value} size="small" color="primary" />
              <Typography variant="caption" color="text.secondary">
                {t('planning.room.metrics.votes', { votes: m.count })} — {m.pct}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={m.pct} sx={{ borderRadius: 4, height: 8 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
