import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Link,
  Box
} from '@mui/material';
import GlowTextButton from './GlowTextButton';

const leagueSpartanStyle = {
  fontFamily: 'League Spartan',
  fontWeight: 700,
  letterSpacing: '0.1em'
};

const AboutDialog = ({ open, onClose, version }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#ffffff',
          color: '#141414'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
        background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
        padding: 0,
        height: '75px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
        position: 'relative'
      }}>
        <Box
          component="img"
          src="/images/HEXTRA-3-logo-Blk.svg"
          alt="HEXTRA-3"
          sx={{
            height: '90px',
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
            marginTop: '-8px',
            position: 'absolute',
            zIndex: 1200,
            transform: 'translateY(25%)'
          }}
        />
      </DialogTitle>
      <DialogContent sx={{ mt: 4 }}>
        <Typography variant="body1" paragraph sx={{ textAlign: 'left', mb: 2 }}>
          HEXTRA-3 is a powerful color processing tool for rapid, professional-grade, product visualization with streamlined batch color-line generation.
        </Typography>
        
        {/* Top row with Version and Contact */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mb: 2,
          alignItems: 'flex-start' 
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Version
            </Typography>
            <Typography variant="body2">
              {version}
            </Typography>
          </Box>
          
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              Contact
            </Typography>
            <Link 
              href="mailto:james@wolfejames.com" 
              underline="hover"
              sx={{ color: '#D50032' }}
            >
              james@wolfejames.com
            </Link>
          </Box>
        </Box>

        {/* Features Grid */}
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1.5 }}>
          Features
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: 2,
          mb: 1
        }}>
          {/* COLORIZE Column */}
          <Box>
            <Typography variant="body2" sx={{ color: '#D50032', ...leagueSpartanStyle, mb: 1 }}>
              COLORIZE
            </Typography>
            <Typography variant="body2" component="div" sx={{ pl: 1 }}>
              • RGB color space simplified
              • Interactive color wheel
              • HEX support Input/Output
            </Typography>
          </Box>

          {/* VISUALIZE Column */}
          <Box>
            <Typography variant="body2" sx={{ color: '#D50032', ...leagueSpartanStyle, mb: 1 }}>
              VISUALIZE
            </Typography>
            <Typography variant="body2" component="div" sx={{ pl: 1 }}>
              • Live fast preview rendering
              • Advanced luminance controls
              • Dark/Light mode
            </Typography>
          </Box>

          {/* MESMERIZE Column */}
          <Box>
            <Typography variant="body2" sx={{ color: '#D50032', ...leagueSpartanStyle, mb: 1 }}>
              MESMERIZE
            </Typography>
            <Typography variant="body2" component="div" sx={{ pl: 1 }}>
              • Rapid PNG Batch processing
              • Multi-catalog support
              • Unique HEXTRA Color System
            </Typography>
          </Box>
        </Box>

        {/* Input/Output as a footer */}
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          mt: 1,
          pt: 1,
          borderTop: '1px solid rgba(0, 0, 0, 0.12)'
        }}>
          <Typography variant="body2" component="div" sx={{ display: 'flex', gap: 4 }}>
            <span><strong>Input:</strong> PNG with alpha</span>
            <span><strong>Output:</strong> PNG, ZIP archives</span>
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        background: 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)'
      }}>
        <GlowTextButton onClick={onClose}>
          Close
        </GlowTextButton>
      </DialogActions>
    </Dialog>
  );
};

export default AboutDialog;
