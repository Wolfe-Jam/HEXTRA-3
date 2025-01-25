import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import ColorPicker from '../components/UniversalViewer/components/ColorPicker';

const HCS = ({ catalog }) => {
  const theme = useTheme();
  const [selectedColor, setSelectedColor] = useState(null);
  
  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  return (
    <>
      <Typography 
        variant="h3" 
        sx={{
          fontFamily: "'League Spartan', sans-serif",
          fontSize: '32px',
          textAlign: 'center',
          mb: 3,
          width: '100%'
        }}
      >
        HEXTRA Color System
      </Typography>

      <Box sx={{ 
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '200px',
        width: '100%',
        maxWidth: '800px',
        mt: 2,
        mx: 'auto',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: '12px'
      }}>
        <Grid container sx={{ width: '100%' }}>
          <Grid item xs={12}>
            <Paper sx={{ 
              width: '100%',
              bgcolor: 'transparent',
              boxShadow: 'none'
            }}>
              <ColorPicker 
                onColorSelect={handleColorSelect}
                catalog={catalog}
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default HCS;
