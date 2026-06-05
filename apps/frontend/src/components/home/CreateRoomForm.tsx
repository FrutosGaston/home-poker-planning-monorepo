import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, TextField, MenuItem, Select, FormControl,
  InputLabel, FormHelperText, Typography, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, IconButton,
} from '@mui/material';
import { ContentCopy, ArrowForward } from '@mui/icons-material';
import type { Deck } from '../../types';
import { deckService } from '../../services/deckService';
import { roomService } from '../../services/roomService';
import { guestUserService } from '../../services/guestUserService';

interface FormValues {
  userName: string;
  roomTitle: string;
  deckId: string;
}

export default function CreateRoomForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [roomUuid, setRoomUuid] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<FormValues>({
    defaultValues: { userName: '', roomTitle: '', deckId: '' },
  });

  useEffect(() => {
    deckService.findDecks().then((d) => {
      setDecks(d);
      if (d.length > 0) setValue('deckId', d[0].id);
    });
  }, []);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const room = await roomService.create({ title: values.roomTitle, deckId: values.deckId });
      const user = await guestUserService.create({ name: values.userName, roomId: room.id, spectator: false });
      guestUserService.saveLoggedUser(user);
      setShareUrl(`${window.location.origin}/room/${room.uuid}`);
      setRoomUuid(room.uuid);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareUrl) { navigator.clipboard.writeText(shareUrl); setCopied(true); }
  };

  const handleEnterRoom = () => { if (roomUuid) navigate(`/room/${roomUuid}`); };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6">{t('planning.home.room-form')}</Typography>

        <Controller
          name="userName"
          control={control}
          rules={{
            required: t('planning.home.name.mandatory'),
            minLength: { value: 3, message: t('planning.home.name.min') },
            maxLength: { value: 20, message: t('planning.home.name.max') },
          }}
          render={({ field }) => (
            <TextField {...field} label={t('planning.home.name')} error={!!errors.userName} helperText={errors.userName?.message} fullWidth />
          )}
        />

        <Controller
          name="roomTitle"
          control={control}
          rules={{
            required: t('planning.home.room-form.title.mandatory'),
            minLength: { value: 3, message: t('planning.home.room-form.title.min') },
            maxLength: { value: 20, message: t('planning.home.room-form.title.max') },
          }}
          render={({ field }) => (
            <TextField {...field} label={t('planning.home.room-form.title')} error={!!errors.roomTitle} helperText={errors.roomTitle?.message} fullWidth />
          )}
        />

        <Controller
          name="deckId"
          control={control}
          rules={{ validate: (v) => v !== '' || t('planning.home.room-form.deck.mandatory') }}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.deckId}>
              <InputLabel>{t('planning.home.room-form.deck')}</InputLabel>
              <Select {...field} label={t('planning.home.room-form.deck')}>
                {decks.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
              </Select>
              {errors.deckId && <FormHelperText>{errors.deckId.message}</FormHelperText>}
            </FormControl>
          )}
        />

        <Button type="submit" variant="contained" disabled={loading} size="large">
          {loading ? <CircularProgress size={24} /> : t('planning.home.room-form.submit')}
        </Button>
      </Box>

      <Dialog open={!!shareUrl} maxWidth="sm" fullWidth>
        <DialogTitle>🎉 Room created!</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <Typography variant="body2" color="text.secondary">
            Share this link with your team so they can join:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField value={shareUrl ?? ''} fullWidth size="small" slotProps={{ input: { readOnly: true } }} sx={{ fontFamily: 'monospace' }} />
            <IconButton onClick={handleCopy} color="primary" title="Copy link"><ContentCopy /></IconButton>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopy} variant="outlined" startIcon={<ContentCopy />}>Copy link</Button>
          <Button onClick={handleEnterRoom} variant="contained" endIcon={<ArrowForward />} autoFocus>Enter room</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)} message="Link copied!" />
    </>
  );
}
