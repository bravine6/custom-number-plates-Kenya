import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Button,
  Container,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Loader from '../components/ui/Loader';
import Message from '../components/ui/Message';
import PlateRenderer from '../components/plates/PlateRenderer';
import animals from '../assets/animals.png';
import kenyaBg1 from '../assets/kenya_bg_1.jpg';
import kenyaBg2 from '../assets/kenya_bg_2.jpg';
import kenyaBg3 from '../assets/kenya_bg_3.jpg';
import filder from '../assets/filder.png';
import landcruiser from '../assets/landcruiser.png';
import subaru from '../assets/subaru.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentCarIndex, setCurrentCarIndex] = useState(0);
  const carouselTimer = useRef(null);
  
  // Check if images are loading correctly
  const carImages = [filder, landcruiser, subaru];
  
  // Console log to check images
  useEffect(() => {
    console.log('Car images:', carImages);
  }, []);

  useEffect(() => {
    // Set up the carousel to change images every 3 seconds
    carouselTimer.current = setInterval(() => {
      setCurrentCarIndex(prevIndex => {
        const newIndex = (prevIndex + 1) % carImages.length;
        console.log('Current car index:', newIndex);
        return newIndex;
      });
    }, 3000);
    
    // Clean up the timer when component unmounts
    return () => {
      if (carouselTimer.current) {
        clearInterval(carouselTimer.current);
      }
    };
  }, [carImages.length]);
  
  // Placeholder data for plate types
  const plateTypes = [
    {
      id: 'special',
      type: 'special',
      title: 'Special Number',
      price: 20000,
      sampleText: 'KAA123',
    },
    {
      id: 'standard_custom',
      type: 'standard_custom',
      title: 'Standard Custom',
      price: 40000,
      sampleText: 'KBB456',
    },
    {
      id: 'prestige',
      type: 'prestige',
      title: 'Prestige Custom',
      price: 80000,
      sampleText: 'NTSA1',
    },
  ];
  
  const handlePlateTypeClick = (plateType) => {
    navigate(`/customize/${plateType}`);
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  return (
    <Box sx={{ pb: 6 }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 4, md: 8 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 4,
        }}
      >
        <Box sx={{ maxWidth: { md: '50%' }, mb: 0 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            fontWeight="bold"
          >
            <strong>Order Your Custom Licence</strong>
          </Typography>
          
          <Typography 
            variant="h5" 
            color="success.main" 
            paragraph
            fontWeight="bold"
          >
            <strong>Plate Yangu, Style yangu</strong>
          </Typography>
          
          <Typography variant="body1" paragraph>
            Secure, stylish, and government-approved plates—made just for you
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {plateTypes.map((type) => (
              <Chip
                key={type.id}
                label={type.title}
                color="primary"
                variant="outlined"
                onClick={() => handlePlateTypeClick(type.type)}
                sx={{ px: 1, py: 2.5 }}
              />
            ))}
          </Box>
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/plate-types')}
            sx={{ fontWeight: 'bold', px: 4 }}
          >
            Choose a Style
          </Button>
        </Box>

        {/* Car Carousel Section */}
        <Box 
          sx={{ 
            width: { xs: '100%', md: '50%' },
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: '#f0f8ff', // Light sky blue background
            borderRadius: '20px',
            height: '400px', // Increased height
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            border: '4px solid #e1f5fe',
          }}
        >
          {/* Decorative elements */}
          <Box 
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '30%',
              background: 'linear-gradient(180deg, #bbdefb 0%, rgba(187, 222, 251, 0) 100%)', // Sky gradient
              opacity: 0.7,
            }}
          />
          
          {/* Sun */}
          <Box 
            sx={{
              position: 'absolute',
              top: '40px',
              right: '40px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, #ffeb3b 30%, #ffc107 100%)',
              boxShadow: '0 0 20px rgba(255, 235, 59, 0.7)',
            }}
          />
          
          {/* Road background */}
          <Box 
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80px',
              backgroundColor: '#455a64', // Darker gray for the road
              borderTop: '2px solid #607d8b',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '6px',
                backgroundColor: '#fff',
                borderStyle: 'dashed',
              }
            }}
          />
          
          {/* Car images */}
          <Box sx={{ position: 'relative', width: '100%', height: '200px' }}>
            {carImages.map((car, index) => (
              <Box
                key={index}
                component="img"
                src={car}
                alt={`Car ${index + 1}`}
                sx={{
                  position: 'absolute',
                  bottom: '-30px',
                  left: '50%',
                  transform: `translateX(-50%) ${index === currentCarIndex ? 'scale(1.1)' : 'scale(0)'}`,
                  maxWidth: '280px', // Bigger car images
                  height: 'auto',
                  transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy animation
                  opacity: index === currentCarIndex ? 1 : 0,
                  visibility: index === currentCarIndex ? 'visible' : 'hidden',
                  zIndex: index === currentCarIndex ? 10 : 1,
                  filter: 'drop-shadow(2px 10px 10px rgba(0,0,0,0.3))',
                }}
              />
            ))}
          </Box>
          
          {/* Clouds */}
          <Box
            sx={{
              position: 'absolute',
              top: '80px',
              left: '15%',
              width: '80px',
              height: '40px',
              backgroundColor: 'white',
              borderRadius: '50px',
              boxShadow: 'inset 0 -5px 5px rgba(0,0,0,0.05)',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-20px',
                left: '15px',
                width: '50px',
                height: '50px',
                backgroundColor: 'white',
                borderRadius: '50%',
              }
            }}
          />
          
          <Box
            sx={{
              position: 'absolute',
              top: '50px',
              left: '60%',
              width: '60px',
              height: '30px',
              backgroundColor: 'white',
              borderRadius: '50px',
              boxShadow: 'inset 0 -5px 5px rgba(0,0,0,0.05)',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: '-15px',
                left: '10px',
                width: '40px',
                height: '40px',
                backgroundColor: 'white',
                borderRadius: '50%',
              }
            }}
          />
          
          {/* Carousel indicators - made cuter */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: '100px', 
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', 
            gap: '12px',
            zIndex: 20,
            padding: '8px 16px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderRadius: '30px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
          }}>
            {carImages.map((_, index) => (
              <Box 
                key={index}
                onClick={() => setCurrentCarIndex(index)}
                sx={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: index === currentCarIndex ? 'primary.main' : 'rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '2px solid white',
                  transform: index === currentCarIndex ? 'scale(1.2)' : 'scale(1)',
                  '&:hover': {
                    transform: 'scale(1.3)',
                    backgroundColor: index === currentCarIndex ? 'primary.dark' : 'rgba(0,0,0,0.4)',
                  }
                }}
              />
            ))}
          </Box>
          
          {/* Carousel title */}
          <Typography
            variant="h5"
            sx={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#1565c0', // Darker blue for better contrast
              fontWeight: 'bold',
              textAlign: 'center',
              width: '100%',
              textShadow: '1px 1px 1px rgba(255,255,255,0.7)',
              backgroundColor: 'rgba(255,255,255,0.6)',
              padding: '8px 0',
              borderRadius: '30px',
              maxWidth: '80%',
              margin: '0 auto'
            }}
          >
            ✨ Your Style, Your Vehicle ✨
          </Typography>
        </Box>

      </Box>
      
      {/* How It Works Section */}
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          How It Works
        </Typography>
        
        <Divider sx={{ mb: 6, maxWidth: '100px', mx: 'auto', borderWidth: 2 }} />
        
        <Grid container spacing={4} justifyContent="center">
          {[
            {
              title: '1. Choose Plate Type',
              description: 'Select from Special, Standard Custom, or Prestige Custom plates.'
            },
            {
              title: '2. Enter Plate Details',
              description: 'Type your desired license plate text and see it rendered instantly.'
            },
            {
              title: '3. Preview Your Plate',
              description: 'See exactly how your plate will look on your vehicle.'
            },
            {
              title: '4. Secure Checkout',
              description: 'Pay securely via M-Pesa or card and complete your order.'
            }
          ].map((step, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography variant="body1">
                    {step.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate('/plate-types')}
            sx={{ mt: 2 }}
          >
            Choose a Plate Type
          </Button>
        </Box>
      </Box>
      
      {/* Plate Types Section */}
      <Box sx={{ py: 8, backgroundColor: '#f9f9f9', borderRadius: 2 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Choose a Plate Type
        </Typography>
        
        <Divider sx={{ mb: 6, maxWidth: '100px', mx: 'auto', borderWidth: 2 }} />
        
        <Grid container spacing={4}>
          {plateTypes.map((type) => (
            <Grid item xs={12} sm={4} key={type.id}>
              <Card 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {type.title}
                  </Typography>
                  
                  <Box sx={{ py: 2 }}>
                    <PlateRenderer 
                      plateType={type.type} 
                      text={type.sampleText} 
                    />
                  </Box>
                  
                  <Typography variant="h4" color="primary" sx={{ mt: 2 }}>
                    {formatPrice(type.price)}
                  </Typography>
                </CardContent>
                
                <Button
                  color="primary"
                  sx={{ m: 2, mt: 0 }}
                  variant="contained"
                  onClick={() => handlePlateTypeClick(type.type)}
                  endIcon={<ArrowForwardIcon />}
                >
                  Customize
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
    </Box>
  );
};

export default HomePage;