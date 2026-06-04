import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Snackbar, TextField } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';

interface Props {
  open: boolean;
  onClose: () => void;
  uuid: string;
}

export default function ShareRoomDialog({ open, onClose, uuid }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const url = `${import.meta.env.VITE_SHARE_ROOM_URL}${uuid}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{t('planning.room.share.copy-title')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', gap: 1, alignItems: 'center', pt: '16px !important' }}>
          <TextField value={url} fullWidth size="small" slotProps={{ input: { readOnly: true } }} />
          <IconButton onClick={handleCopy} color="primary">
            <ContentCopy />
          </IconButton>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
          <Button onClick={handleCopy} variant="contained">
            {t('planning.room.share.copy-button')}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message={t('planning.room.share.copied')}
      />
    </>
  );
}
