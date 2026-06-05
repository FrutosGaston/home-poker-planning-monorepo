import { useCallback, useRef, useState } from 'react';
import { Box, Button, Tooltip, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { SocketEvents } from '@poker/shared';
import type { ReactionPayload } from '@poker/shared';
import { useRoomStore } from '../../store/roomStore';
import { useSocket, getSocket } from '../../hooks/useSocket';

const REACTIONS = ['👍', '😕', '🤔', '🎉', '⚡'];
const IS_MOCK = import.meta.env.DEV && import.meta.env.VITE_MOCK === 'true';

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
  label: string;
}

export default function EmojiReactions() {
  const room = useRoomStore((s) => s.room);
  const currentUser = useRoomStore((s) => s.currentUser);
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [myReactions, setMyReactions] = useState<Set<string>>(new Set());
  const nextId = useRef(0);

  const addFloating = (emoji: string, label: string) => {
    const id = ++nextId.current;
    const x = Math.random() * 80 - 40;
    setFloating((f) => [...f, { id, emoji, x, label }]);
    setTimeout(() => setFloating((f) => f.filter((r) => r.id !== id)), 1500);
  };

  useSocket(SocketEvents.REACTION, useCallback((data: ReactionPayload) => {
    setCounts((c) => ({ ...c, [data.emoji]: (c[data.emoji] ?? 0) + 1 }));
    addFloating(data.emoji, data.userName);
  }, []));

  const react = (emoji: string) => {
    if (myReactions.has(emoji) || !room || !currentUser) return;
    setMyReactions((r) => new Set([...r, emoji]));

    const payload: ReactionPayload = {
      emoji,
      userId: currentUser.id,
      userName: currentUser.name,
      roomId: room.id,
    };

    if (IS_MOCK) {
      setCounts((c) => ({ ...c, [emoji]: (c[emoji] ?? 0) + 1 }));
      addFloating(emoji, currentUser.name);
    } else {
      getSocket().emit('reaction', payload);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
      {REACTIONS.map((emoji) => {
        const hasReacted = myReactions.has(emoji);
        return (
          <Tooltip key={emoji} title={(counts[emoji] ?? 0) > 0 ? `${counts[emoji]} reaction${counts[emoji] > 1 ? 's' : ''}` : ''}>
            <span>
              <Button
                onClick={() => react(emoji)}
                disabled={hasReacted}
                sx={{ minWidth: 0, px: 1, fontSize: 18, position: 'relative', opacity: hasReacted ? 0.4 : 1 }}
                size="small"
              >
                {emoji}
                {(counts[emoji] ?? 0) > 0 && (
                  <Typography
                    variant="caption"
                    sx={{ position: 'absolute', top: -4, right: -4, bgcolor: 'primary.main', color: 'white', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}
                  >
                    {counts[emoji]}
                  </Typography>
                )}
              </Button>
            </span>
          </Tooltip>
        );
      })}

      <AnimatePresence>
        {floating.map((r) => (
          <motion.div
            key={r.id}
            initial={{ y: 0, opacity: 1, x: r.x }}
            animate={{ y: -70, opacity: 0, x: r.x }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
            style={{ position: 'absolute', bottom: 0, left: '50%', pointerEvents: 'none', zIndex: 10, textAlign: 'center' }}
          >
            <div style={{ fontSize: 24 }}>{r.emoji}</div>
            <div style={{ fontSize: 10, opacity: 0.7, whiteSpace: 'nowrap' }}>{r.label}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </Box>
  );
}
