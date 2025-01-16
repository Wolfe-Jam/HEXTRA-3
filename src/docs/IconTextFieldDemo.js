import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import IconTextField from '../components/IconTextField';
import { 
  SearchRounded as SearchIcon,
  LinkRounded as LinkIcon,
  EmailRounded as EmailIcon,
  ColorLensRounded as ColorIcon
} from '@mui/icons-material';

const DemoSection = ({ title, children }) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    {children}
  </Box>
);

export default function IconTextFieldDemo() {
  const [values, setValues] = useState({
    search: 'Search example...',
    url: 'https://example.com',
    email: 'user@example.com',
    hex: '#FED141'
  });

  const handleChange = (field) => (e) => {
    setValues({ ...values, [field]: e.target.value });
  };

  const handleReset = (field) => () => {
    setValues({ ...values, [field]: '' });
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 4, color: 'white' }}>
        IconTextField Component Examples
      </Typography>

      <DemoSection title="1. Search Input (Default State)">
        <IconTextField
          value={values.search}
          onChange={handleChange('search')}
          placeholder="Search..."
          startIcon={<SearchIcon />}
          hasReset
          onReset={handleReset('search')}
          sx={{ width: '300px' }}
        />
      </DemoSection>

      <DemoSection title="2. URL Input (Focused State)">
        <IconTextField
          value={values.url}
          onChange={handleChange('url')}
          placeholder="Enter URL"
          startIcon={<LinkIcon />}
          hasReset
          onReset={handleReset('url')}
          sx={{ width: '400px' }}
          autoFocus
        />
      </DemoSection>

      <DemoSection title="3. Email Input (Error State)">
        <IconTextField
          value={values.email}
          onChange={handleChange('email')}
          placeholder="Enter email"
          startIcon={<EmailIcon />}
          hasReset
          onReset={handleReset('email')}
          error
          helperText="Invalid email format"
          sx={{ width: '300px' }}
        />
      </DemoSection>

      <DemoSection title="4. HEX Input (Compact)">
        <IconTextField
          value={values.hex}
          onChange={handleChange('hex')}
          placeholder="Enter HEX"
          startIcon={<ColorIcon />}
          hasReset
          onReset={handleReset('hex')}
          sx={{ width: '200px' }}
        />
      </DemoSection>
    </Box>
  );
}
