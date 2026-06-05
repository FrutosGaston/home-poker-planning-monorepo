import { useEffect, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { Timer, Stop } from '@mui/icons-material';

interface Props {
  isHost: boolean;
}

const DURATIONS = [30, 60, 90, 120];

export default function RoundTimer({ isHost }: Props) {
  const [active, setActive] = useState(false);
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = (secs: number) => {
    setDuration(secs);
    setRemaining(secs);
    setActive(true);
  };

  const stop = () => {
    setActive(false);
    setRemaining(duration);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (!active) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) { setActive(false); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active]);

  const pct = (remaining / duration) * 100;
  const color = pct > 50 ? 'success' : pct > 20 ? 'warning' : 'error';

  if (!active && !isHost) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {active ? (
        <>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={pct}
              size={36}
              color={color}
            />
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 10 }}>
                {remaining}
              </Typography>
            </Box>
          </Box>
          {isHost && (
            <Button size="small" color="error" onClick={stop} startIcon={<Stop />} sx={{ minWidth: 0 }}>
              Stop
            </Button>
          )}
        </>
      ) : (
        isHost && (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <Timer fontSize="small" color="action" />
            {DURATIONS.map((s) => (
              <Button key={s} size="small" variant="outlined" onClick={() => start(s)} sx={{ minWidth: 0, px: 0.8, py: 0.2, fontSize: 11 }}>
                {s}s
              </Button>
            ))}
          </Box>
        )
      )}
    </Box>
  );
}
