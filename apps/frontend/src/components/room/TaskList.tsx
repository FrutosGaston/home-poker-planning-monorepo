import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Collapse, Divider, List, ListItemButton, ListItemText, TextField, Tooltip, Typography } from '@mui/material';
import { Add, ExpandLess, ExpandMore } from '@mui/icons-material';
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
  const [newDescription, setNewDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!newTitle.trim()) { setError(t('planning.room.task-title.mandatory')); return; }
    const task = await taskService.create({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      roomId,
    });
    addTask(task);
    setNewTitle('');
    setNewDescription('');
    setError('');
  };

  return (
    <Box sx={{ width: 280, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ p: 2 }}>{t('planning.room.taskList.button')}</Typography>
      <Divider />
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {tasks.map((task) => (
          <Tooltip
            key={task.id}
            title={task.description || ''}
            placement="right"
            disableHoverListener={!task.description}
          >
            <ListItemButton
              selected={task.id === selectedTaskId}
              onClick={() => onSelectTask(task)}
            >
              <ListItemText
                primary={task.title}
                secondary={task.finalEstimation
                  ? `${t('planning.room.final-estimation.label')}: ${task.finalEstimation.value}`
                  : task.description
                    ? <Typography variant="caption" color="text.secondary" noWrap>{task.description}</Typography>
                    : undefined
                }
              />
            </ListItemButton>
          </Tooltip>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            label={t('planning.room.task-title.label')}
            size="small"
            error={!!error}
            helperText={error}
            onKeyDown={(e) => e.key === 'Enter' && !showDescription && handleCreate()}
            fullWidth
          />
          <Button
            variant="text"
            size="small"
            onClick={() => setShowDescription(!showDescription)}
            sx={{ minWidth: 0, px: 1 }}
            title="Add description"
          >
            {showDescription ? <ExpandLess /> : <ExpandMore />}
          </Button>
          <Button variant="contained" onClick={handleCreate} sx={{ minWidth: 0 }}>
            <Add />
          </Button>
        </Box>
        <Collapse in={showDescription}>
          <TextField
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            label="Description (optional)"
            size="small"
            multiline
            rows={2}
            fullWidth
            onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && handleCreate()}
          />
        </Collapse>
      </Box>
    </Box>
  );
}
