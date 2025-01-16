import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const GlowTextButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  '&:hover': {
    backgroundColor: 'var(--bg-secondary)',
    borderColor: 'var(--glow-color)',
    color: 'var(--glow-color)',
    boxShadow: '0 0 0 3px var(--glow-subtle)',
    transform: 'scale(1.05)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'var(--disabled-bg)',
    color: 'var(--text-disabled)',
  },
  '&.MuiButton-contained': {
    backgroundColor: 'var(--text-primary)',
    color: 'var(--bg-primary)',
    '&:hover': {
      backgroundColor: 'var(--text-primary)',
      borderColor: 'var(--glow-color)',
      color: 'var(--glow-color)',
      boxShadow: '0 0 0 3px var(--glow-subtle)',
      transform: 'scale(1.05)',
    },
    '&.Mui-disabled': {
      backgroundColor: 'var(--text-disabled)',
      color: 'var(--bg-primary)',
      opacity: 0.5
    }
  },
  fontFamily: "'Inter', sans-serif",
  textTransform: 'none',
  minWidth: '100px',
  padding: '6px 16px',
  boxShadow: 'none',
  border: '1px solid var(--border-color)',
  transition: 'all 0.2s ease-in-out'
}));

export default GlowTextButton;
