import { createTheme } from '@mui/material/styles';

export const getTheme = (dark: boolean) =>
  createTheme({
    palette: {
      mode: dark ? 'dark' : 'light',
      primary: { main: '#00897B' },
      secondary: { main: '#26A69A' },
    },
    shape: { borderRadius: 12 },
  });
