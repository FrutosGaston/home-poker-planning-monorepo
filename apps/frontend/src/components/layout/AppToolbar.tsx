import { AppBar, Box, Toolbar, IconButton, Select, MenuItem, Tooltip } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface Props {
  dark: boolean;
  onToggleTheme: () => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

export default function AppToolbar({ dark, onToggleTheme }: Props) {
  const { t, i18n } = useTranslation();

  const handleLangChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('activeLang', lang);
  };

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar sx={{ gap: 1 }}>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <img src="/logo.svg" alt="Planning Poker" height={36} style={{ display: 'block' }} />
        </Box>

        <Select
          value={i18n.language}
          onChange={(e) => handleLangChange(e.target.value)}
          size="small"
          sx={{ color: 'inherit', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' } }}
        >
          {LANGUAGES.map((l) => (
            <MenuItem key={l.code} value={l.code}>{l.label}</MenuItem>
          ))}
        </Select>

        <Tooltip title={t('dark-mode')}>
          <IconButton color="inherit" onClick={onToggleTheme}>
            {dark ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
}
