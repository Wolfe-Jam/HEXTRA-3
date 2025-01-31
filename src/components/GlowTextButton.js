import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const GlowTextButton = styled(Button)(({ theme }) => ({
  backgroundColor: 'var(--element-bg)',
  color: 'var(--text-primary)',
  '&:hover': {
    backgroundColor: 'var(--element-bg)',
    borderColor: 'var(--glow-color)',
    color: 'var(--glow-color)',
    boxShadow: '0 0 0 3px var(--glow-subtle)',
    transform: 'scale(1.05)',
  },
  '&.Mui-disabled': {
    backgroundColor: 'var(--element-bg)',
    color: 'var(--text-disabled)',
    opacity: 0.5,
    pointerEvents: 'none'
  },
  '&.MuiButton-contained': {
    backgroundColor: 'var(--element-bg)',
    color: 'var(--text-primary)',
    '&:hover': {
      backgroundColor: 'var(--element-bg)',
      borderColor: 'var(--glow-color)',
      color: 'var(--glow-color)',
      boxShadow: '0 0 0 3px var(--glow-subtle)',
      transform: 'scale(1.05)',
    },
    '&.Mui-disabled': {
      backgroundColor: 'var(--element-bg)',
      color: 'var(--text-disabled)',
      opacity: 0.5,
      pointerEvents: 'none'
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
