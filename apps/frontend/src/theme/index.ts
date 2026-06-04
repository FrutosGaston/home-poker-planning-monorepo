import { createTheme } from '@mui/material/styles';

export const getTheme = (dark: boolean) =>
  createTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
      primary: { main: '#7c4dff' },
      secondary: { main: '#ff4081' },
    },
    shape: { borderRadius: 12 },
  });
