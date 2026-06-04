import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card, CardActionArea, Typography, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task, GuestUser, Card as CardType } from '../../types';
import { taskService } from '../../services/taskService';
import { useRoomStore } from '../../store/roomStore';

interface Props {
  task: Task;
  currentUser: GuestUser;
  cards: CardType[];
  isHost: boolean;
  revealed: boolean;
  onReveal: () => void;
  onReset: () => void;
}

export default function EstimationForm({ task, currentUser, cards, isHost, revealed, onReveal, onReset }: Props) {
  const { t } = useTranslation();
  const updateTask = useRoomStore((s) => s.updateTask);
  const [finalCardId, setFinalCardId] = useState<string>('');
  const [finalError, setFinalError] = useState('');
  const myEstimation = task.estimations.find((e) => e.guestUserId === currentUser.id);

  const handleVote = async (card: CardType) => {
    if (currentUser.spectator) return;
    await taskService.estimate({ cardId: card.id, taskId: task.id, guestUserId: currentUser.id });
  };

  const handleFinalEstimation = async () => {
    if (!finalCardId) { setFinalError(t('planning.room.card.mandatory')); return; }
    const updated = await taskService.estimateFinal({ cardId: finalCardId, taskId: task.id });
    updateTask(updated);
    setFinalError('');
  };

  if (currentUser.spectator) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Box sx={{ p: 2 }}>
          {!revealed ? (
            <>
              <Typography variant="subtitle2" gutterBottom>{t('planning.room.choose-a-card')}</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {cards.map((card) => (
                  <Card
                    key={card.id}
                    elevation={myEstimation?.card.id === card.id ? 8 : 2}
                    sx={{
                      width: 48, height: 64, cursor: 'pointer',
                      border: myEstimation?.card.id === card.id ? '2px solid' : '1px solid',
                      borderColor: myEstimation?.card.id === card.id ? 'primary.main' : 'divider',
                      transition: 'transform 0.15s',
                      '&:hover': { transform: 'translateY(-4px)' },
                    }}
                  >
                    <CardActionArea sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleVote(card)}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{card.value}</Typography>
                    </CardActionArea>
                  </Card>
                ))}
              </Box>

              {isHost && (
                <Button variant="outlined" sx={{ mt: 2 }} onClick={onReveal}>
                  {t('planning.room.flip.button')}
                </Button>
              )}
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <FormControl size="small" error={!!finalError} sx={{ minWidth: 140 }}>
                <InputLabel>{t('planning.room.card.label')}</InputLabel>
                <Select
                  value={finalCardId}
                  label={t('planning.room.card.label')}
                  onChange={(e) => setFinalCardId(e.target.value)}
                >
                  {cards.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.value}</MenuItem>
                  ))}
                </Select>
                {finalError && <FormHelperText>{finalError}</FormHelperText>}
              </FormControl>
              <Button variant="contained" onClick={handleFinalEstimation}>
                {t('planning.room.estimate')}
              </Button>
              <Button variant="outlined" color="warning" onClick={onReset}>
                {t('planning.room.reset.button')}
              </Button>
            </Box>
          )}
        </Box>
      </motion.div>
    </AnimatePresence>
  );
}
