import React, { useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import ColorPicker from '../components/UniversalViewer/components/ColorPicker';

const ColorDemo = ({ catalog }) => {
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
        maxWidth: '800px',
        overflow: 'hidden',
        mt: 2,
        p: 3,
        mx: 'auto',
        bgcolor: '#FFFFFF',  
        '@media (max-width: 832px)': {
          maxWidth: 'calc(100% - 32px)',
          p: 2
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
