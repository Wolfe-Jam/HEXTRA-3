import React, { useState } from 'react';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import ColorPicker from '../components/UniversalViewer/components/ColorPicker';

const ColorDemo = ({ catalog }) => {
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
          textAlign: 'left',
          mb: 3,
          ml: { xs: 4, sm: 'calc((100% - 800px) / 2 + 24px)' }  
        }}
      >
        HEXTRA Color System
      </Typography>

      <Box sx={{ 
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        width: '100%',
        maxWidth: '832px',
        mt: 2,
        mx: 'auto',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderRadius: '12px',
        '@media (max-width: 832px)': {
          maxWidth: 'calc(100% - 32px)',
        }
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

export default ColorDemo;
