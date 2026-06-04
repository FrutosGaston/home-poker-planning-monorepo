import { useState } from 'react';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CreateRoomForm from '../../components/home/CreateRoomForm';
import AbstractShape from '../../components/home/AbstractShape';

type View = 'none' | 'create';

export default function HomePage() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>('none');

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center' }}>
      <AbstractShape color="#7c4dff33" size={300} top="-50px" left="-80px" />
      <AbstractShape color="#ff408133" size={200} bottom="50px" right="-40px" />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: 6 }}>
        {view === 'none' && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" sx={{ fontWeight: 700 }} gutterBottom>
              🃏 Planning Poker
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('planning.home.subtitle')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
              <Button variant="contained" size="large" onClick={() => setView('create')}>
                {t('planning.home.create-room')}
              </Button>
            </Box>
          </Box>
        )}

        {view === 'create' && (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
            <CreateRoomForm />
            <Button sx={{ mt: 2 }} onClick={() => setView('none')}>
              ← Back
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
