import { Box, Typography, Grid, Paper, Card, CardContent, Divider, Container, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const HowItWorksPage = () => {
  const steps = [
    {
      title: 'Choose Your Plate Type',
      description: 'Select from three categories: Special Number, Standard Custom, or Prestige Custom. Each type has different pricing and personalization options.',
      image: '/src/assets/step1.jpg',
    },
    {
      title: 'Enter Your Plate Details',
      description: 'Type your desired plate text and see it rendered instantly. Each plate type has specific format requirements that our system will help you follow.',
      image: '/src/assets/step2.jpg',
    },
    {
      title: 'Preview Your Plate',
      description: 'Our system generates a real-time preview showing exactly how your custom plate will look. View it on a vehicle mockup to ensure it meets your expectations.',
      image: '/src/assets/step3.jpg',
    },
    {
      title: 'Secure Checkout',
      description: 'Complete your order with our secure payment options. Choose between M-Pesa or card payment, along with your preferred shipping method.',
      image: '/src/assets/step4.jpg',
    },
  ];
  
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center">
        How It Works
      </Typography>
      
      <Divider sx={{ mb: 6, maxWidth: '100px', mx: 'auto', borderWidth: 2 }} />
      
      <Typography variant="h6" color="text.secondary" textAlign="center" sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}>
        Ordering your custom license plate is simple and straightforward.
        Follow these four easy steps to get your personalized NTSA plate.
      </Typography>
      
      {steps.map((step, index) => (
        <Paper 
          key={index} 
          elevation={0} 
          sx={{
            p: 4,
            mb: 6,
            backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white',
            borderRadius: 3,
          }}
        >
          <Grid container spacing={4} alignItems="center" direction={index % 2 === 0 ? 'row' : 'row-reverse'}>
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h4" 
                component="h2" 
                gutterBottom 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  '&:before': {
                    content: `"${index + 1}"`,
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    mr: 2,
                    fontWeight: 'bold',
                  },
                }}
              >
                {step.title}
              </Typography>
              
              <Typography variant="body1" paragraph color="text.secondary" sx={{ fontSize: '1.1rem' }}>
                {step.description}
              </Typography>
              
              {index === 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to="/plate-types"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ mt: 2 }}
                >
                  Choose Your Plate
                </Button>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src={step.image || 'https://via.placeholder.com/600x400'}
                alt={step.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      ))}
      
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Ready to Create Your Custom Plate?
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          Start the process now and get your personalized plate in just a few simple steps.
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={RouterLink}
          to="/plate-types"
          endIcon={<ArrowForwardIcon />}
          sx={{ mt: 2, px: 4, py: 1.5 }}
        >
          Get Started
        </Button>
      </Box>
    </Box>
  );
};

export default HowItWorksPage;