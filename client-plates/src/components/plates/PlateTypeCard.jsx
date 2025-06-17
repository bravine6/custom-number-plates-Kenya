import { Card, CardContent, CardActions, Typography, Button, Box, Stack, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import PlateRenderer from './PlateRenderer';

const PlateTypeCard = ({ type, title, description, price, sampleTexts }) => {
  const navigate = useNavigate();
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const handleCustomize = () => {
    navigate(`/customize/${type}`);
  };
  
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
        },
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 'bold' }}>
            Sample Plates:
          </Typography>
          
          <Stack spacing={2}>
            {sampleTexts.map((text, index) => (
              <Box 
                key={index} 
                sx={{ 
                  transform: index === 1 ? 'scale(1.05)' : 'scale(1)',
                  zIndex: index === 1 ? 2 : 1,
                  position: 'relative',
                  boxShadow: index === 1 ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  borderRadius: '4px',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    zIndex: 3,
                  }
                }}
              >
                {type === 'prestige' ? (
                  // For prestige plates, pass the background index to show different backgrounds
                  <PlateRenderer plateType={type} text={text} small bgIndex={index + 1} />
                ) : (
                  // For other plate types, just render normally
                  <PlateRenderer plateType={type} text={text} small />
                )}
                
                {/* Add background label for prestige plates */}
                {type === 'prestige' && (
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block', 
                      textAlign: 'center', 
                      mt: 0.5,
                      fontWeight: 'bold',
                      color: 'text.secondary' 
                    }}
                  >
                    Background {index + 1}: {index === 0 ? 'Mt. Kenya' : index === 1 ? 'Wildlife' : 'Nairobi'}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mt: 2 }}>
          {description}
        </Typography>
        
        <Typography variant="h4" color="primary" fontWeight="bold" sx={{ mt: 2 }}>
          {formatPrice(price)}
        </Typography>
      </CardContent>
      
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          onClick={handleCustomize}
          sx={{ borderRadius: '20px' }}
        >
          Customize
        </Button>
      </CardActions>
    </Card>
  );
};

export default PlateTypeCard;