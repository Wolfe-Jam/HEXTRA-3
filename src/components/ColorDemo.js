import React from 'react';
import { Box, Typography } from '@mui/material';

function ColorDemo({ catalog }) {
  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Color Catalog Preview
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {catalog.map((color, index) => (
          <Box
            key={index}
            sx={{
              width: 40,
              height: 40,
              backgroundColor: color.hex,
              borderRadius: 1,
              border: '1px solid rgba(0,0,0,0.1)',
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.1)',
                transition: 'transform 0.2s'
              }
            }}
            title={color.name}
          />
        ))}
      </Box>
    </Box>
  );
}

export default ColorDemo;
