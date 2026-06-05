import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Card as MuiCard, CardActionArea, IconButton, Tooltip, Typography, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { motion } from 'framer-motion';
import type { Task, GuestUser, Card as CardType } from '../../types';
import { taskService } from '../../services/taskService';
import { roomService } from '../../services/roomService';
import { useRoomStore } from '../../store/roomStore';

interface Props {
  task: Task | null;
  currentUser: GuestUser;
  cards: CardType[];
  isHost: boolean;
  revealed: boolean;
  onReveal: () => void;
  onReset: () => void;
}

export default function EstimationForm({ task, currentUser, cards, revealed, onReveal, onReset }: Props) {
  const { t } = useTranslation();
  const updateTask = useRoomStore((s) => s.updateTask);
  const room = useRoomStore((s) => s.room);
  const setCurrentTask = useRoomStore((s) => s.setCurrentTask);
  const [finalCardId, setFinalCardId] = useState<string>('');
  const [finalError, setFinalError] = useState('');
  const [fanMode, setFanMode] = useState(() => localStorage.getItem('cardFanMode') !== 'false');

  const toggleFanMode = () => setFanMode((v) => {
    localStorage.setItem('cardFanMode', String(!v));
    return !v;
  });

  const myEstimation = task?.estimations?.find((e) => e.guestUserId === currentUser.id);
  const selectedCardId = myEstimation?.card.id;

  const handleVote = async (card: CardType) => {
    if (currentUser.spectator) return;

    let activeTask = task ?? null;

    if (!activeTask && room) {
      activeTask = await taskService.create({ title: 'Estimation', roomId: room.id });
      setCurrentTask(activeTask);
      // Update room's selectedTaskId so all clients sync to the same task via ROOM_UPDATED
      await roomService.update(room.id, { selectedTaskId: activeTask!.id });
    }

    if (!activeTask) return;
    await taskService.estimate({ cardId: card.id, taskId: activeTask.id, guestUserId: currentUser.id });
  };

  const handleFinalEstimation = async () => {
    if (!finalCardId || !task) { setFinalError(t('planning.room.card.mandatory')); return; }
    const updated = await taskService.estimateFinal({ cardId: finalCardId, taskId: task.id });
    updateTask(updated);
    setFinalError('');
  };

  if (currentUser.spectator) return null;
  if (!cards.length) return <Box sx={{ p: 2, color: 'text.secondary' }}>Deck not loaded — try refreshing.</Box>;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Box sx={{ p: 2 }}>
        {!revealed ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="subtitle2">{t('planning.room.choose-a-card')}</Typography>
              <Tooltip title={fanMode ? 'Switch to grid view' : 'Switch to hand view'}>
                <IconButton onClick={toggleFanMode} sx={{ fontSize: 22 }}>
                  {fanMode ? '⊞' : '🃏'}
                </IconButton>
              </Tooltip>
            </Box>

            {fanMode ? (
            <Box sx={{ position: 'relative', height: 150, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', mb: 1 }}>
              {cards.map((card, i) => {
                const total = cards.length;
                const mid = (total - 1) / 2;
                const angle = (i - mid) * (40 / total);
                const tx = (i - mid) * (540 / total);
                const isSelected = selectedCardId === card.id;

                return (
                  <Box
                    key={card.id}
                    onClick={() => handleVote(card)}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      width: 84,
                      height: 120,
                      cursor: 'pointer',
                      transformOrigin: 'bottom center',
                      transform: `translateX(${tx}px) rotate(${angle}deg)`,
                      transition: 'transform 0.2s ease, z-index 0s',
                      zIndex: isSelected ? 20 : i,
                      '&:hover': {
                        transform: `translateX(${tx}px) rotate(${angle}deg) translateY(-40px) scale(1.1)`,
                        zIndex: 30,
                      },
                    }}
                  >
                    <MuiCard
                      elevation={isSelected ? 10 : 3}
                      sx={{
                        width: '100%',
                        height: '100%',
                        border: isSelected ? '2px solid' : '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        borderRadius: '8px',
                        bgcolor: isSelected ? 'primary.dark' : 'background.paper',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        userSelect: 'none',
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          color: isSelected ? 'primary.contrastText' : 'text.primary',
                          fontSize: card.value.length > 2 ? 16 : 22,
                        }}
                      >
                        {card.value}
                      </Typography>
                    </MuiCard>
                  </Box>
                );
              })}
            </Box>
            ) : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 1 }}>
              {cards.map((card) => {
                const isSelected = selectedCardId === card.id;
                return (
                  <MuiCard
                    key={card.id}
                    elevation={isSelected ? 8 : 2}
                    sx={{
                      width: 48, height: 64, cursor: 'pointer',
                      border: isSelected ? '2px solid' : '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'divider',
                      transition: 'transform 0.15s',
                      '&:hover': { transform: 'translateY(-4px)' },
                    }}
                  >
                    <CardActionArea sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleVote(card)}>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{card.value}</Typography>
                    </CardActionArea>
                  </MuiCard>
                );
              })}
            </Box>
            )}

            {task && (
              <Button variant="outlined" sx={{ mt: 1 }} onClick={onReveal}>
                {t('planning.room.flip.button')}
              </Button>
            )}
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <FormControl size="small" error={!!finalError} sx={{ minWidth: 200 }}>
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
  );
}
