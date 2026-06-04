import { Box, Tooltip, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { GuestUser, Task } from '../../types';

interface Props {
  user: GuestUser;
  currentTask: Task | null;
  isCurrentUser: boolean;
  revealed: boolean;
}

export default function UserInRoom({ user, currentTask, isCurrentUser, revealed }: Props) {
  const estimation = currentTask?.estimations.find((e) => e.guestUserId === user.id);
  const hasVoted = !!estimation;

  return (
    <Tooltip title={user.name}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
        <motion.div
          animate={{ rotateY: revealed && hasVoted ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          style={{ transformStyle: 'preserve-3d', position: 'relative', width: 48, height: 64 }}
        >
          {/* Card back */}
          <Box
            sx={{
              position: 'absolute', inset: 0,
              bgcolor: isCurrentUser ? 'primary.main' : 'secondary.main',
              borderRadius: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backfaceVisibility: 'hidden',
              border: hasVoted ? '2px solid' : '2px dashed',
              borderColor: hasVoted ? 'success.main' : 'divider',
            }}
          >
            {!revealed && hasVoted && (
              <Typography variant="caption" color="white">✓</Typography>
            )}
            {user.spectator && (
              <Typography variant="caption" color="white">👁</Typography>
            )}
          </Box>

          {/* Card front (shown when flipped) */}
          <Box
            sx={{
              position: 'absolute', inset: 0,
              bgcolor: 'background.paper',
              borderRadius: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              border: '2px solid',
              borderColor: 'primary.main',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {estimation?.card.value ?? '?'}
            </Typography>
          </Box>
        </motion.div>

        <Typography variant="caption" noWrap sx={{ maxWidth: 60 }}>
          {user.name}
        </Typography>
      </Box>
    </Tooltip>
  );
}
