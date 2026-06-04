import { Box, Tooltip, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import type { GuestUser, Task } from '../../types';

interface Props {
  user: GuestUser;
  currentTask: Task | null;
  isCurrentUser: boolean;
  revealed: boolean;
}

const CARD_W = 70;
const CARD_H = 95;

export default function UserInRoom({ user, currentTask, isCurrentUser, revealed }: Props) {
  const estimation = currentTask?.estimations.find((e) => e.guestUserId === user.id);
  const hasVoted = !!estimation;
  const showCard = hasVoted || user.spectator;
  const isInactive = user.inactive;

  return (
    <Tooltip title={isInactive ? `${user.name} (inactive)` : user.name}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, opacity: isInactive ? 0.35 : 1, filter: isInactive ? 'grayscale(1)' : 'none', transition: 'opacity 0.5s, filter 0.5s' }}>

        {/* Card area — fixed size so layout doesn't shift */}
        <Box sx={{ width: CARD_W, height: CARD_H, position: 'relative' }}>
          <AnimatePresence mode="popLayout">
            {showCard && (
              <motion.div
                key={estimation?.id ?? (user.spectator ? 'spectator' : 'voted')}
                initial={{ y: CARD_H * 2.5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -CARD_H * 1.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                style={{ width: '100%', height: '100%', position: 'absolute' }}
              >
                <motion.div
                  animate={{ rotateY: revealed && hasVoted ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    transformStyle: 'preserve-3d',
                    position: 'relative',
                  }}
                >
                  {/* Card back — dark with logo */}
                  <Box
                    sx={{
                      position: 'absolute', inset: 0,
                      bgcolor: '#212121',
                      borderRadius: '10px',
                      boxShadow: '0 0 8px 0 rgba(0,0,0,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {user.spectator ? (
                      <Typography sx={{ fontSize: 22 }}>👁</Typography>
                    ) : (
                      <img src="/logo.svg" alt="" width={CARD_W * 0.6} style={{ opacity: 0.9 }} />
                    )}
                  </Box>

                  {/* Card front — estimate value */}
                  <Box
                    sx={{
                      position: 'absolute', inset: 0,
                      bgcolor: isCurrentUser ? 'primary.light' : 'background.paper',
                      borderRadius: '10px',
                      boxShadow: '0 0 8px 0 rgba(0,0,0,0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      border: '2px solid',
                      borderColor: isCurrentUser ? 'primary.main' : 'divider',
                    }}
                  >
                    <Typography sx={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                      {estimation?.card.value ?? '?'}
                    </Typography>
                  </Box>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Placeholder outline when user hasn't voted yet */}
          {!showCard && (
            <Box
              sx={{
                width: '100%', height: '100%',
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: '10px',
                opacity: 0.4,
              }}
            />
          )}
        </Box>

        <Typography variant="caption" noWrap sx={{ maxWidth: CARD_W + 10, textAlign: 'center' }}>
          {user.name}
        </Typography>
      </Box>
    </Tooltip>
  );
}
