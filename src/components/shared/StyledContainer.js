import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: '832px',
  margin: '16px auto',
  padding: '24px',
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#fff',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  border: `1px solid ${
    theme.palette.mode === 'dark' 
      ? 'rgba(255,255,255,0.1)' 
      : 'rgba(0,0,0,0.1)'
  }`,
  
  '@media (max-width: 832px)': {
    maxWidth: 'calc(100% - 32px)',
    padding: '16px',
  }
}));
