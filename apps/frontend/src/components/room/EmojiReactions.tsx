import { useState } from 'react';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const REACTIONS = ['👍', '😕', '🤔', '🎉', '⚡'];

interface Reaction {
  id: number;
  emoji: string;
  x: number;
}

export default function EmojiReactions() {
  const [floating, setFloating] = useState<Reaction[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  let nextId = 0;

  const react = (emoji: string) => {
    const id = ++nextId;
    const x = Math.random() * 60 - 30;
    setFloating((f) => [...f, { id, emoji, x }]);
    setCounts((c) => ({ ...c, [emoji]: (c[emoji] ?? 0) + 1 }));
    setTimeout(() => setFloating((f) => f.filter((r) => r.id !== id)), 1500);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
      {REACTIONS.map((emoji) => (
        <Tooltip key={emoji} title={counts[emoji] ? `${counts[emoji]}` : ''}>
          <Button
            onClick={() => react(emoji)}
            sx={{ minWidth: 0, px: 1, fontSize: 18, position: 'relative' }}
            size="small"
          >
            {emoji}
            {counts[emoji] > 0 && (
              <Typography
                variant="caption"
                sx={{ position: 'absolute', top: -4, right: -4, bgcolor: 'primary.main', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}
              >
                {counts[emoji]}
              </Typography>
            )}
          </Button>
        </Tooltip>
      ))}

      {/* Floating emoji animations */}
      <AnimatePresence>
        {floating.map((r) => (
          <motion.div
            key={r.id}
            initial={{ y: 0, opacity: 1, x: r.x }}
            animate={{ y: -60, opacity: 0, x: r.x }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ position: 'absolute', bottom: 0, left: '50%', fontSize: 24, pointerEvents: 'none', zIndex: 10 }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
}
