import { Box, Container, Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CreateRoomForm from '../../components/home/CreateRoomForm';
import AbstractShape from '../../components/home/AbstractShape';

const BLOB1_INITIAL = 'M421.84 183.863c41.842 72.274 82.599 125.801 82.872 188.566.27 62.765-39.807 134.496-108.142 179.871-68.335 45.24-165.063 63.988-241.413 30.975C78.67 550.262 22.563 465.353 5.58 375.961c-16.982-89.528 5.298-183.54 59.912-258.667C119.97 42.031 206.78-14.213 271.72 3.176c64.938 17.39 108.14 108.412 150.12 180.687z';
const BLOB1_FINAL = 'M497.964 125.495c61.963 80.797 89.942 185.343 54.456 248.944-35.622 63.464-134.98 86.12-224.65 129.794C238.101 547.908 157.986 612.6 98.89 597.86 39.928 583.12 1.986 488.947.075 407.467c-1.91-81.48 32.346-150.267 79.16-227.516 46.813-77.385 106.183-163.233 183.705-177.7 77.522-14.467 173.196 42.446 235.023 123.244z';
const BLOB2_INITIAL = 'M497.964 125.495c61.963 80.797 89.942 185.343 54.456 248.944-35.622 63.464-134.98 86.12-224.65 129.794C238.101 547.908 157.986 612.6 98.89 597.86 39.928 583.12 1.986 488.947.075 407.467c-1.91-81.48 32.346-150.267 79.16-227.516 46.813-77.385 106.183-163.233 183.705-177.7 77.522-14.467 173.196 42.446 235.023 123.244z';
const BLOB2_FINAL = 'M421.84 183.863c41.842 72.274 82.599 125.801 82.872 188.566.27 62.765-39.807 134.496-108.142 179.871-68.335 45.24-165.063 63.988-241.413 30.975C78.67 550.262 22.563 465.353 5.58 375.961c-16.982-89.528 5.298-183.54 59.912-258.667C119.97 42.031 206.78-14.213 271.72 3.176c64.938 17.39 108.14 108.412 150.12 180.687z';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center' }}>
      <AbstractShape color="#4DB6AC35" size={720} top="-120px" left="-150px" initialPath={BLOB1_INITIAL} finalPath={BLOB1_FINAL} duration={30} floatX={25} floatY={35} />
      <AbstractShape color="#4DB6AC35" size={620} bottom="-100px" right="-120px" initialPath={BLOB2_INITIAL} finalPath={BLOB2_FINAL} duration={25} floatX={-20} floatY={-25} />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Box sx={{
              borderRadius: '20px', border: '3px solid', borderColor: 'primary.main',
              overflow: 'hidden', display: 'inline-flex', bgcolor: 'action.hover', p: '6px',
            }}>
              <img src="/logo.svg" alt="Planning Poker" height={80} style={{ display: 'block', borderRadius: '14px' }} />
            </Box>
          </Box>
          <Typography variant="h6" color="text.secondary">
            {t('planning.home.subtitle')}
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <CreateRoomForm />
        </Paper>
      </Container>
    </Box>
  );
}
