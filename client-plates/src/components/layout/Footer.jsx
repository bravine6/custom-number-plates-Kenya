import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              NTSA Custom Plates
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Official online platform for ordering custom vehicle license plates in Kenya.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Quick Links
            </Typography>
            <Link component={RouterLink} to="/" color="inherit" display="block" sx={{ mb: 1 }}>
              Home
            </Link>
            <Link component={RouterLink} to="/how-it-works" color="inherit" display="block" sx={{ mb: 1 }}>
              How It Works
            </Link>
            <Link component={RouterLink} to="/plate-types" color="inherit" display="block" sx={{ mb: 1 }}>
              Plate Types
            </Link>
            <Link component={RouterLink} to="/login" color="inherit" display="block">
              Login / Register
            </Link>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Contact Information
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              National Transport and Safety Authority<br />
              Hill Park Building, Upper Hill Road<br />
              P.O. Box 3602-00506<br />
              Nairobi, Kenya
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Customer Care: +254 20 2989000
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, borderTop: '1px solid #ddd', pt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {'Copyright © '}
            <Link color="inherit" component={RouterLink} to="/">
              NTSA Kenya
            </Link>{' '}
            {currentYear}
            {'. All rights reserved.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;