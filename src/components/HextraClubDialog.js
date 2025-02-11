/**
 * HextraClubDialog Component (v2.2.2)
 * 
 * Modal dialog wrapper for the HEXTRA Club subscription component.
 * Shows pricing tiers and handles subscription flow.
 * 
 * @version 2.2.2
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  useMediaQuery,
  useTheme
} from '@mui/material';
import HextraClub from './HextraClub';

const HextraClubDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="xl"
      PaperProps={{
        sx: {
          backgroundColor: 'var(--bg-primary)',
          backgroundImage: 'none',
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <HextraClub onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default HextraClubDialog;
