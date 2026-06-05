import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Divider, LinearProgress, Typography } from '@mui/material';
import type { Task } from '../../types';

interface Props {
  task: Task;
}

function toNumber(value: string): number | null {
  if (value === '?' || value === '☕') return null;
  if (value === '½') return 0.5;
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
}

export default function EstimationMetrics({ task }: Props) {
  const { t } = useTranslation();

  const { metrics, average, median } = useMemo(() => {
    const counts: Record<string, { value: string; count: number }> = {};
    task.estimations.forEach((e) => {
      const val = e.card.value;
      if (!counts[val]) counts[val] = { value: val, count: 0 };
      counts[val].count++;
    });
    const total = task.estimations.length;
    const sorted = Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .map((m) => ({ ...m, pct: total ? Math.round((m.count / total) * 100) : 0 }));

    // Numeric values only for average/median
    const nums = task.estimations
      .map((e) => toNumber(e.card.value))
      .filter((n): n is number => n !== null)
      .sort((a, b) => a - b);

    const average = nums.length
      ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
      : null;

    const median = nums.length
      ? nums.length % 2 === 0
        ? (nums[nums.length / 2 - 1] + nums[nums.length / 2]) / 2
        : nums[Math.floor(nums.length / 2)]
      : null;

    return { metrics: sorted, average, median };
  }, [task.estimations]);

  if (!metrics.length) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {t('planning.room.metrics.title')}
        </Typography>
        {(average !== null || median !== null) && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {average !== null && (
              <Chip label={`avg ${average}`} size="small" variant="outlined" color="primary" />
            )}
            {median !== null && (
              <Chip label={`median ${median}`} size="small" variant="outlined" color="secondary" />
            )}
          </Box>
        )}
      </Box>
      <Divider sx={{ mb: 1.5 }} />
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
