import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Divider, List, ListItemButton, ListItemText, TextField, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import type { Task } from '../../types';
import { taskService } from '../../services/taskService';
import { useRoomStore } from '../../store/roomStore';

interface Props {
  tasks: Task[];
  roomId: string;
  selectedTaskId?: string;
  onSelectTask: (task: Task) => void;
}

export default function TaskList({ tasks, roomId, selectedTaskId, onSelectTask }: Props) {
  const { t } = useTranslation();
  const addTask = useRoomStore((s) => s.addTask);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!newTitle.trim()) { setError(t('planning.room.task-title.mandatory')); return; }
    const task = await taskService.create({ title: newTitle.trim(), roomId });
    addTask(task);
    setNewTitle('');
    setError('');
  };

  return (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ p: 2 }}>{t('planning.room.taskList.button')}</Typography>
      <Divider />
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {tasks.map((task) => (
          <ListItemButton
            key={task.id}
            selected={task.id === selectedTaskId}
            onClick={() => onSelectTask(task)}
          >
            <ListItemText
              primary={task.title}
              secondary={task.finalEstimation ? `${t('planning.room.final-estimation.label')}: ${task.finalEstimation.value}` : undefined}
            />
          </ListItemButton>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <TextField
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          label={t('planning.room.task-title.label')}
          size="small"
          error={!!error}
          helperText={error}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          fullWidth
        />
        <Button variant="contained" onClick={handleCreate} sx={{ minWidth: 0 }}>
          <Add />
        </Button>
      </Box>
    </Box>
  );
}
