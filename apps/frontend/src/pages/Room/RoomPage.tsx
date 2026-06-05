import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Chip, CircularProgress, Drawer, IconButton,
  Paper, Snackbar, Alert, Toolbar, Tooltip, Typography,
} from '@mui/material';
import { List, Share } from '@mui/icons-material';
import { useRoomStore } from '../../store/roomStore';
import { roomService } from '../../services/roomService';
import { taskService } from '../../services/taskService';
import { guestUserService } from '../../services/guestUserService';
import { useSocket, useJoinRoom, useHeartbeat, useConnectionStatus } from '../../hooks/useSocket';
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
    addTask, updateTask, addUser, removeUser, addEstimation, clearEstimations,
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

      const stored = guestUserService.getLoggedUser(r.id);
      if (stored) {
        // Check if the stored user still exists in the DB (may have been kicked for inactivity)
        const stillExists = loadedUsers.find((u) => u.id === stored.id);
        if (stillExists) {
          setCurrentUser(stillExists);
        } else {
          // Recreate with same name and spectator setting
          const rejoined = await guestUserService.create({
            name: stored.name,
            roomId: r.id,
            spectator: stored.spectator,
          });
          guestUserService.saveLoggedUser(rejoined);
          setCurrentUser(rejoined);
        }
      }

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

  // Connection status for reconnecting banner
  const connected = useConnectionStatus();

  // Join the socket.io room channel once
  useJoinRoom(room?.id ?? null);

  // Send heartbeat every 30s so server knows we're alive
  useHeartbeat(currentUser?.id ?? null);

  // Socket.io subscriptions
  useSocket(SocketEvents.ESTIMATION_CREATED, useCallback((e) => addEstimation(e), []));
  useSocket(SocketEvents.TASK_ESTIMATED, useCallback((t) => updateTask(t), []));
  useSocket(SocketEvents.TASK_CREATED, useCallback((t) => {
    addTask(t);
    if (!useRoomStore.getState().currentTask) setCurrentTask(t);
  }, []));
  useSocket(SocketEvents.ESTIMATIONS_INVALIDATED, useCallback((t) => { clearEstimations(t.id); setRevealed(false); }, []));
  useSocket(SocketEvents.ROOM_UPDATED, useCallback((r) => {
    setRoom(r);
    const task = tasks.find((t) => t.id === r.selectedTaskId) ?? null;
    if (task) { setCurrentTask(task); setRevealed(false); }
  }, [tasks]));
  useSocket(SocketEvents.GUEST_USER_CREATED, useCallback((u) => addUser(u), []));
  useSocket(SocketEvents.GUEST_USER_LEFT, useCallback((u) => removeUser(u.id), []));

  // Split users around the table:
  // - left and right get 1 user each (2 if >12 users)
  // - above and below share the rest evenly
  const { above, below, left, right } = useMemo(() => {
    const voters = users.filter((u) => !u.spectator);
    const sideSlots = voters.length > 16 ? 2 : 1;
    const left = voters.slice(0, sideSlots);
    const right = voters.slice(sideSlots, sideSlots * 2);
    const remaining = voters.slice(sideSlots * 2);
    const half = Math.ceil(remaining.length / 2);
    return {
      above: remaining.slice(0, half),
      below: remaining.slice(half),
      left,
      right,
    };
  }, [users]);

  const isHost = useMemo(
    () => users.length > 0 && users[0]?.id === currentUser?.id,
    [users, currentUser]
  );

  const allVoted = useMemo(
    () => users.filter((u) => !u.spectator && !u.inactive).length > 0 &&
      users.filter((u) => !u.spectator && !u.inactive).every((u) => currentTask?.estimations.some((e) => e.guestUserId === u.id)),
    [users, currentTask]
  );

  useEffect(() => {
    if (allVoted) setRevealed(true);
  }, [allVoted]);

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
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
          {currentUser && (
            <Tooltip title={currentUser.spectator ? 'Switch to voter' : 'Switch to spectator'}>
              <Chip
                label={currentUser.spectator ? '👁 Spectator' : '🗳 Voter'}
                size="small"
                variant="outlined"
                onClick={async () => {
                  const updated = await guestUserService.toggleSpectator(currentUser.id);
                  if (updated) {
                    setCurrentUser(updated);
                    guestUserService.saveLoggedUser(updated);
                  }
                }}
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>
          )}
          <Tooltip title={t('planning.room.share.button')}>
            <IconButton onClick={() => setShareOpen(true)}>
              <Share />
            </IconButton>
          </Tooltip>
        </Toolbar>

        {/* Table area */}
        <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, p: 2 }}>
          {/* Users above */}
          <Box sx={{ display: 'flex', justifyContent: 'space-evenly', width: '100%', maxWidth: 1200 }}>
            {above.map((u) => (
              <UserInRoom key={u.id} user={u} currentTask={currentTask} isCurrentUser={u.id === currentUser?.id} revealed={revealed} />
            ))}
          </Box>

          {/* Middle row: left | table | right */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 4, alignSelf: 'stretch', py: 2 }}>
              {left.map((u) => (
                <UserInRoom key={u.id} user={u} currentTask={currentTask} isCurrentUser={u.id === currentUser?.id} revealed={revealed} />
              ))}
            </Box>

            {/* Table surface */}
            <Paper
              elevation={4}
              sx={{
                flexGrow: 1,
                maxWidth: 1200,
                height: '30vh',
                minHeight: 160,
                borderRadius: '24px',
                border: '4px solid #80CBC4',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0D2B27' : '#E0F2F1',
                p: 3, gap: 1,
              }}
            >
              {currentTask?.finalEstimation ? (
                <Typography variant="h4" sx={{ fontWeight: 700 }} color="primary">
                  {t('planning.room.task.final-estimation', { estimation: currentTask.finalEstimation.value })}
                </Typography>
              ) : currentTask ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    {currentTask.title}
                  </Typography>
                  {currentTask.description && (
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block', maxWidth: 400, mx: 'auto' }}>
                      {currentTask.description}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('planning.room.taskList.button')} →
                </Typography>
              )}
            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', gap: 4, alignSelf: 'stretch', py: 2 }}>
              {right.map((u) => (
                <UserInRoom key={u.id} user={u} currentTask={currentTask} isCurrentUser={u.id === currentUser?.id} revealed={revealed} />
              ))}
            </Box>
          </Box>

          {/* Users below */}
          <Box sx={{ display: 'flex', justifyContent: 'space-evenly', width: '100%', maxWidth: 1200 }}>
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
        {currentUser && !currentUser.spectator && (
          <Paper elevation={3} sx={{ borderTop: 1, borderColor: 'divider' }}>
            <EstimationForm
              task={currentTask ?? null}
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

      {/* Reconnecting banner */}
      <Snackbar open={!connected} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="warning" sx={{ width: '100%' }}>
          Connection lost — reconnecting...
        </Alert>
      </Snackbar>
    </Box>
  );
}
