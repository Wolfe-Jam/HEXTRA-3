import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

const AdminEmailsPage = () => {
  const { isAuthenticated, user } = useKindeAuth();
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails();
    }
  }, [isAuthenticated]);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/get-emails');
      
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      
      const data = await response.json();
      setEmails(data.emails || []);
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError('Failed to load email subscribers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    window.location.href = '/api/export-emails';
  };

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4">Please log in to access this page</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, maxWidth: '800px', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Email Subscribers
      </Typography>
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body1">
          Total subscribers: {emails.length}
        </Typography>
        
        <Button 
          variant="contained" 
          onClick={handleExportCSV}
          sx={{
            backgroundColor: '#D50032',
            '&:hover': {
              backgroundColor: '#B8002C',
            }
          }}
        >
          Export as CSV
        </Button>
      </Box>
      
      <Paper sx={{ p: 2 }}>
        {loading ? (
          <Typography>Loading subscribers...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : emails.length === 0 ? (
          <Typography>No subscribers found.</Typography>
        ) : (
          <List>
            {emails.map((email, index) => (
              <React.Fragment key={email}>
                <ListItem>
                  <ListItemText primary={email} />
                </ListItem>
                {index < emails.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default AdminEmailsPage;
