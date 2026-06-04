import { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { getTheme } from './theme';
import AppToolbar from './components/layout/AppToolbar';
import HomePage from './pages/Home/HomePage';
import RoomPage from './pages/Room/RoomPage';

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('darkMode') === 'true');
  const theme = useMemo(() => getTheme(dark), [dark]);

  const toggleTheme = () => {
    setDark((d) => {
      localStorage.setItem('darkMode', String(!d));
      return !d;
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppToolbar dark={dark} onToggleTheme={toggleTheme} />
          <Box component="main" sx={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/room" element={<RoomPage />} />
              <Route path="/room/:uuid" element={<RoomPage />} />
            </Routes>
          </Box>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}
