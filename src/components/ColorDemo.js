import React, { useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import ColorPicker from '../components/UniversalViewer/components/ColorPicker';

const ColorDemo = ({ catalog }) => {
  const [selectedColor, setSelectedColor] = useState(null);
  
  const handleColorSelect = (color) => {
    setSelectedColor(color);
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h3" gutterBottom>
        HEXTRA Color System
      </Typography>
      
      <Grid container spacing={4}>
        {/* Color Picker */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <ColorPicker 
              onColorSelect={handleColorSelect}
              catalog={catalog}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ColorDemo;
