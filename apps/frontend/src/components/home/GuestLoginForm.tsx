import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Box, Button, TextField, FormControlLabel, Checkbox, Typography, CircularProgress } from '@mui/material';
import { useState } from 'react';
import type { GuestUser } from '../../types';
import { guestUserService } from '../../services/guestUserService';

interface Props {
  roomId: string;
  onLogin: (user: GuestUser) => void;
}

interface FormValues {
  name: string;
  spectator: boolean;
}

export default function GuestLoginForm({ roomId, onLogin }: Props) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: '', spectator: false },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const user = await guestUserService.create({ name: values.name, roomId, spectator: values.spectator });
      guestUserService.saveLoggedUser(user);
      onLogin(user);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h6">{t('planning.home.join-room')}</Typography>

      <Controller
        name="name"
        control={control}
        rules={{
          required: t('planning.home.name.mandatory'),
          minLength: { value: 3, message: t('planning.home.name.min') },
          maxLength: { value: 20, message: t('planning.home.name.max') },
        }}
        render={({ field }) => (
          <TextField
            {...field}
            label={t('planning.home.name')}
            error={!!errors.name}
            helperText={errors.name?.message}
            fullWidth
          />
        )}
      />

      <Controller
        name="spectator"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={<Checkbox {...field} checked={field.value} />}
            label={t('planning.home.spectator')}
          />
        )}
      />

      <Button type="submit" variant="contained" disabled={loading} size="large">
        {loading ? <CircularProgress size={24} /> : t('planning.home.submit')}
      </Button>
    </Box>
  );
}
