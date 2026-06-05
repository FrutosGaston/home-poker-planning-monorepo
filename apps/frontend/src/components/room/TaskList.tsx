import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, Chip, Collapse, Divider, List, ListItemButton,
  ListItemText, Tab, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import { Add, Download, ExpandLess, ExpandMore, CheckCircle, RadioButtonUnchecked } from '@mui/icons-material';
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
  const [tab, setTab] = useState(0);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [error, setError] = useState('');

  const pending = tasks.filter((t) => !t.finalEstimation);
  const completed = tasks.filter((t) => t.finalEstimation);
  const shown = tab === 0 ? pending : completed;

  const exportCSV = () => {
    const completed = tasks.filter((t) => t.finalEstimation);
    if (!completed.length) return;
    const rows = [
      ['Task', 'Description', 'Final Estimation', 'Votes'],
      ...completed.map((t) => [
        `"${t.title.replace(/"/g, '""')}"`,
        `"${(t.description ?? '').replace(/"/g, '""')}"`,
        t.finalEstimation?.value ?? '',
        String(t.estimations.length),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'planning-poker-results.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

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
    <Box sx={{ width: 300, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 2 }}>
        <Typography variant="h6">{t('planning.room.taskList.button')}</Typography>
        {completed.length > 0 && (
          <Tooltip title="Export results as CSV">
            <Button size="small" onClick={exportCSV} startIcon={<Download />} sx={{ minWidth: 0 }}>
              CSV
            </Button>
          </Tooltip>
        )}
      </Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 1 }}>
        <Tab label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <RadioButtonUnchecked sx={{ fontSize: 16 }} />
            Pending {pending.length > 0 && <Chip label={pending.length} size="small" sx={{ height: 16, fontSize: 10 }} />}
          </Box>
        } />
        <Tab label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CheckCircle sx={{ fontSize: 16 }} color="success" />
            Done {completed.length > 0 && <Chip label={completed.length} size="small" color="success" sx={{ height: 16, fontSize: 10 }} />}
          </Box>
        } />
      </Tabs>
      <Divider />
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {shown.length === 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ p: 2, display: 'block', textAlign: 'center' }}>
            {tab === 0 ? 'No pending tasks' : 'No completed tasks yet'}
          </Typography>
        )}
        {shown.map((task) => (
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
                secondary={
                  task.finalEstimation
                    ? <Chip label={task.finalEstimation.value} size="small" color="primary" sx={{ height: 18, fontSize: 11 }} />
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
