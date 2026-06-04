import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, CircularProgress, Drawer, Fab, IconButton,
  Paper, Toolbar, Tooltip, Typography,
} from '@mui/material';
import { List, Share } from '@mui/icons-material';
import { useRoomStore } from '../../store/roomStore';
import { roomService } from '../../services/roomService';
import { taskService } from '../../services/taskService';
import { guestUserService } from '../../services/guestUserService';
import { useSocket } from '../../hooks/useSocket';
import { SocketEvents } from '@poker/shared';
import UserInRoom from '../../components/room/UserInRoom';
import EstimationForm from '../../components/room/EstimationForm';
import EstimationMetrics from '../../components/room/EstimationMetrics';
import TaskList from '../../components/room/TaskList';
import ShareRoomDialog from '../../components/room/ShareRoomDialog';
import GuestLoginForm from '../../components/home/GuestLoginForm';
import type { Room, Task } from '../../types';

export default function RoomPage() {
  const { uuid } = useParams<{ uuid: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    room, tasks, users, currentTask, currentUser,
    setRoom, setTasks, setUsers, setCurrentTask, setCurrentUser,
    addTask, updateTask, addUser, addEstimation, clearEstimations,
  } = useRoomStore();

  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Load room data
  useEffect(() => {
    if (!uuid) { navigate('/'); return; }
    setLoading(true);
    roomService.getByUUID(uuid).then(async (r: Room) => {
      setRoom(r);
      const [loadedTasks, loadedUsers] = await Promise.all([
        taskService.getByRoom(r.id),
        guestUserService.findByRoom(r.id),
      ]);
      setTasks(loadedTasks);
      setUsers(loadedUsers);

      const loggedUser = guestUserService.getLoggedUser(r.id);
      if (loggedUser) setCurrentUser(loggedUser);

      const activeTask = loadedTasks.find((t: Task) => t.id === r.selectedTaskId) ?? loadedTasks[0] ?? null;
      setCurrentTask(activeTask);
    }).finally(() => setLoading(false));
  }, [uuid]);

  const handleSelectTask = useCallback(async (task: Task) => {
    if (!room) return;
    setCurrentTask(task);
    setRevealed(false);
    await roomService.update(room.id, { selectedTaskId: task.id });
  }, [room]);

  const handleReset = useCallback(async () => {
    if (!currentTask) return;
    await taskService.invalidateEstimations(currentTask.id);
    clearEstimations(currentTask.id);
    setRevealed(false);
  }, [currentTask]);

  // Socket.io subscriptions
  useSocket(SocketEvents.ESTIMATION_CREATED, room?.id ?? null, useCallback((e) => addEstimation(e), []));
  useSocket(SocketEvents.TASK_ESTIMATED, room?.id ?? null, useCallback((t) => updateTask(t), []));
  useSocket(SocketEvents.TASK_CREATED, room?.id ?? null, useCallback((t) => addTask(t), []));
  useSocket(SocketEvents.ESTIMATIONS_INVALIDATED, room?.id ?? null, useCallback((t) => { clearEstimations(t.id); setRevealed(false); }, []));
  useSocket(SocketEvents.ROOM_UPDATED, room?.id ?? null, useCallback((r) => {
    setRoom(r);
    const task = tasks.find((t) => t.id === r.selectedTaskId) ?? null;
    if (task) { setCurrentTask(task); setRevealed(false); }
  }, [tasks]));
  useSocket(SocketEvents.GUEST_USER_CREATED, room?.id ?? null, useCallback((u) => addUser(u), []));

  // Split users around the table
  const { above, below, left, right } = useMemo(() => {
    const voters = users.filter((u) => !u.spectator);
    const quarter = Math.ceil(voters.length / 4);
    return {
      above: voters.slice(0, quarter),
      below: voters.slice(quarter, quarter * 2),
      left: voters.slice(quarter * 2, quarter * 3),
      right: voters.slice(quarter * 3),
    };
  }, [users]);

  const isHost = useMemo(
    () => users.length > 0 && users[0]?.id === currentUser?.id,
    [users, currentUser]
  );

  const allVoted = useMemo(
    () => users.filter((u) => !u.spectator).length > 0 &&
      users.filter((u) => !u.spectator).every((u) => currentTask?.estimations.some((e) => e.guestUserId === u.id)),
    [users, currentTask]
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;

  if (!currentUser && room) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', borderRadius: 3 }}>
          <GuestLoginForm roomId={room.id} onLogin={setCurrentUser} />
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Task Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {room && (
          <TaskList
            tasks={tasks}
            roomId={room.id}
            selectedTaskId={currentTask?.id}
            onSelectTask={(t) => { handleSelectTask(t); setDrawerOpen(false); }}
          />
        )}
      </Drawer>

      {/* Share Dialog */}
      {room && <ShareRoomDialog open={shareOpen} onClose={() => setShareOpen(false)} uuid={room.uuid} />}

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Room header */}
        <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', gap: 1 }}>
          <IconButton onClick={() => setDrawerOpen(true)}>
            <List />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {room ? t('planning.room.title', { title: room.title }) : ''}
          </Typography>
          {currentTask && (
            <Typography variant="body2" color="text.secondary">
              {t('planning.room.task.title', { title: currentTask.title })}
            </Typography>
          )}
          <Tooltip title={t('planning.room.share.button')}>
            <IconButton onClick={() => setShareOpen(true)}>
              <Share />
            </IconButton>
          </Tooltip>
        </Toolbar>

        {/* Table area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 2 }}>
          {/* Users above */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {above.map((u) => (
              <UserInRoom key={u.id} user={u} currentTask={currentTask} isCurrentUser={u.id === currentUser?.id} revealed={revealed} />
            ))}
          </Box>

          {/* Middle row: left | table | right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {left.map((u) => (
                <UserInRoom key={u.id} user={u} currentTask={currentTask} isCurrentUser={u.id === currentUser?.id} revealed={revealed} />
              ))}
            </Box>

            {/* Table surface */}
            <Paper
              elevation={4}
              sx={{
                minWidth: 260, minHeight: 140, borderRadius: 8,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                bgcolor: 'action.hover', p: 3, gap: 1,
              }}
            >
              {currentTask?.estimation ? (
                <Typography variant="h4" sx={{ fontWeight: 700 }} color="primary">
                  {t('planning.room.task.final-estimation', { estimation: currentTask.estimation.card.value })}
                </Typography>
              ) : currentTask ? (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                  {currentTask.title}
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('planning.room.taskList.button')} →
                </Typography>
              )}
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {right.map((u) => (
                <UserInRoom key={u.id} user={u} currentTask={currentTask} isCurrentUser={u.id === currentUser?.id} revealed={revealed} />
              ))}
            </Box>
          </Box>

          {/* Users below */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            {below.map((u) => (
              <UserInRoom key={u.id} user={u} currentTask={currentTask} isCurrentUser={u.id === currentUser?.id} revealed={revealed} />
            ))}
          </Box>
        </Box>

        {/* Metrics */}
        {(revealed || allVoted) && currentTask && (
          <Paper elevation={2} sx={{ mx: 2, mb: 1, borderRadius: 2 }}>
            <EstimationMetrics task={currentTask} />
          </Paper>
        )}

        {/* Estimation controls */}
        {currentTask && currentUser && !currentUser.spectator && (
          <Paper elevation={3} sx={{ borderTop: 1, borderColor: 'divider' }}>
            <EstimationForm
              task={currentTask}
              currentUser={currentUser}
              cards={room?.deck.cards ?? []}
              isHost={isHost}
              revealed={revealed}
              onReveal={() => setRevealed(true)}
              onReset={handleReset}
            />
          </Paper>
        )}
      </Box>

      {/* FAB: Tasks */}
      <Fab
        color="primary"
        size="small"
        sx={{ position: 'fixed', bottom: 24, left: 24 }}
        onClick={() => setDrawerOpen(true)}
      >
        <List />
      </Fab>
    </Box>
  );
}
