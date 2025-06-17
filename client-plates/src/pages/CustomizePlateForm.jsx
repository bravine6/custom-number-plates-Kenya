import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Divider,
  FormHelperText,
  RadioGroup,
  Radio,
  FormControlLabel,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PlateRenderer from '../components/plates/PlateRenderer';
import Loader from '../components/ui/Loader';
import Message from '../components/ui/Message';
import { useCart } from '../contexts/CartContext';
import { generatePlatePreview, checkPlateAvailability } from '../services/plateService';

const CustomizePlateForm = () => {
  const { plateType } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [plateText, setPlateText] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState('1'); // Default to first background
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const availabilityCheckTimeout = useRef(null);
  
  // Plate type details
  const plateTypes = {
    'special': {
      title: 'Special Number',
      price: 20000,
      description: 'Choose a plate with a special number sequence that includes two or more zeros.',
      validationPattern: '^[A-Z0-9]*00[A-Z0-9]*$',
      validationMessage: 'Special plates must include at least two zeros (00) and have max 7 characters',
      validate: (text) => {
        return text.includes('00') && text.length <= 7;
      }
    },
    'standard_custom': {
      title: 'Star Plate',
      price: 40000,
      description: 'Create a custom plate with a mix of letters, numbers and heart emoji.',
      validationPattern: '^[A-Z0-9❤<3]{4,7}$',
      validationMessage: 'Star plates must have 4-7 characters (letters, numbers, or heart emoji)',
    },
    'prestige': {
      title: 'Premium Custom',
      price: 80000,
      description: 'Premium personalized plates with unique letter combinations, featuring beautiful Kenyan landscape backgrounds.',
      validationPattern: '^[A-Z0-9]{4,7}$',
      validationMessage: 'Premium plates must have 4-7 characters (letters or numbers)',
    },
  };
  
  // Validate if valid plate type is selected
  useEffect(() => {
    if (!plateTypes[plateType]) {
      navigate('/plate-types');
    }
  }, [plateType, navigate]);
  
  const validatePlateText = (text) => {
    if (!text) {
      setIsValid(false);
      setErrorMessage('Please enter plate text');
      return false;
    }
    
    const plateInfo = plateTypes[plateType];
    if (!plateInfo) return false;
    
    // Special validation for special plates
    if (plateType === 'special' && plateInfo.validate) {
      if (!plateInfo.validate(text.toUpperCase())) {
        setIsValid(false);
        setErrorMessage(plateInfo.validationMessage);
        return false;
      }
    } else {
      // Regular validation based on pattern
      const pattern = new RegExp(plateInfo.validationPattern);
      
      if (!pattern.test(text.toUpperCase())) {
        setIsValid(false);
        setErrorMessage(plateInfo.validationMessage);
        return false;
      }
    }
    
    setIsValid(true);
    setErrorMessage('');
    return true;
  };
  
  // Function to check plate availability
  const checkAvailability = async (text) => {
    // Only check if text is valid and not empty
    if (!validatePlateText(text) || !text) {
      setAvailabilityStatus(null);
      return;
    }
    
    setIsCheckingAvailability(true);
    
    try {
      const result = await checkPlateAvailability(text);
      setAvailabilityStatus(result);
    } catch (error) {
      console.error('Error checking availability:', error);
      setAvailabilityStatus({
        isAvailable: false,
        message: 'Error checking availability'
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };
  
  const handleTextChange = (e) => {
    const text = e.target.value.toUpperCase();
    setPlateText(text);
    validatePlateText(text);
    
    // Clear previous timeout if exists
    if (availabilityCheckTimeout.current) {
      clearTimeout(availabilityCheckTimeout.current);
    }
    
    // Set new timeout for availability check (debounce)
    availabilityCheckTimeout.current = setTimeout(() => {
      checkAvailability(text);
    }, 500); // Check after 500ms of no typing
  };
  
  const handleAddToCart = async () => {
    if (!validatePlateText(plateText)) return;
    
    setLoading(true);
    setError(null);
    
    // First check availability to ensure plate isn't taken
    try {
      const availabilityResult = await checkPlateAvailability(plateText);
      
      if (!availabilityResult.isAvailable) {
        setError(availabilityResult.message || 'This plate text is already taken. Please choose another.');
        setLoading(false);
        return;
      }
    } catch (error) {
      // Continue anyway - we'll rely on the server to do the final check
      console.log('Availability check error:', error);
    }
    
    try {
      // In a real app, this would call an API to generate a preview
      // For now, we'll create a simple object
      const plateInfo = plateTypes[plateType];
      
      // Generate preview (in production this would be an API call)
      // const preview = await generatePlatePreview(plateText, plateType);
      
      // Create plate object
      const plate = {
        id: `${plateType}-${plateText}-${Date.now()}`, // Temporary ID
        text: plateText,
        plateType,
        price: plateInfo.price,
        previewUrl: null, // Would be set from API in production
        // Include background selection for prestige plates
        backgroundIndex: plateType === 'prestige' ? parseInt(selectedBackground) : null,
      };
      
      // Add to cart
      addToCart(plate);
      
      // Navigate to cart
      navigate('/cart');
    } catch (error) {
      setError(error.message || 'Failed to add plate to cart');
    } finally {
      setLoading(false);
    }
  };
  
  // Get plate info for the selected type
  const plateInfo = plateTypes[plateType] || {};
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  if (loading) return <Loader />;
  
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom textAlign="center">
        Customize Your {plateInfo.title} Plate
      </Typography>
      
      <Divider sx={{ mb: 4, maxWidth: '100px', mx: 'auto', borderWidth: 2 }} />
      
      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Enter Your Plate Text
              </Typography>
              
              <TextField
                label="Plate Text"
                variant="outlined"
                fullWidth
                value={plateText}
                onChange={handleTextChange}
                error={!isValid || (availabilityStatus && !availabilityStatus.isAvailable)}
                helperText={errorMessage}
                sx={{ mb: 2 }}
                inputProps={{ 
                  style: { textTransform: 'uppercase' },
                  maxLength: 7,
                }}
              />
              
              {/* Availability indicator */}
              {isCheckingAvailability && plateText && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Checking availability...
                  </Typography>
                </Box>
              )}
              
              {availabilityStatus && !isCheckingAvailability && plateText && (
                <Alert 
                  severity={availabilityStatus.isAvailable ? "success" : "error"}
                  icon={availabilityStatus.isAvailable ? <CheckCircleIcon /> : <ErrorIcon />}
                  sx={{ mb: 2 }}
                >
                  {availabilityStatus.message}
                </Alert>
              )}
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="subtitle2" gutterBottom>
                  LIVE PREVIEW
                </Typography>
                
                {plateType === 'prestige' ? (
                  // For prestige plates, show all three background options
                  <Box>
                    <PlateRenderer 
                      plateType={plateType} 
                      text={plateText || 'SAMPLE'} 
                      bgIndex={parseInt(selectedBackground)}
                    />
                    
                    <Box sx={{ mt: 3, mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom color="text.secondary">
                        Select Background:
                      </Typography>
                      
                      <RadioGroup
                        row
                        value={selectedBackground}
                        onChange={(e) => setSelectedBackground(e.target.value)}
                        sx={{ justifyContent: 'center', mb: 2 }}
                      >
                        <FormControlLabel 
                          value="1" 
                          control={<Radio color="primary" />} 
                          label={<Typography sx={{ fontWeight: selectedBackground === "1" ? 'bold' : 'normal' }}>Mt. Kenya</Typography>} 
                          sx={{ 
                            mx: 2,
                            p: 1, 
                            borderRadius: 2,
                            bgcolor: selectedBackground === "1" ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                          }}
                        />
                        <FormControlLabel 
                          value="2" 
                          control={<Radio color="primary" />} 
                          label={<Typography sx={{ fontWeight: selectedBackground === "2" ? 'bold' : 'normal' }}>Wildlife</Typography>} 
                          sx={{ 
                            mx: 2,
                            p: 1, 
                            borderRadius: 2,
                            bgcolor: selectedBackground === "2" ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                          }}
                        />
                        <FormControlLabel 
                          value="3" 
                          control={<Radio color="primary" />} 
                          label={<Typography sx={{ fontWeight: selectedBackground === "3" ? 'bold' : 'normal' }}>Nairobi</Typography>} 
                          sx={{ 
                            mx: 2,
                            p: 1, 
                            borderRadius: 2,
                            bgcolor: selectedBackground === "3" ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                          }}
                        />
                      </RadioGroup>
                    </Box>
                  </Box>
                ) : (
                  // For other plate types, just show the single preview
                  <PlateRenderer 
                    plateType={plateType} 
                    text={plateText || 'SAMPLE'} 
                  />
                )}
              </Box>
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
                  {formatPrice(plateInfo.price)}
                </Typography>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={
                    !isValid || 
                    !plateText || 
                    isCheckingAvailability || 
                    (availabilityStatus && !availabilityStatus.isAvailable)
                  }
                  onClick={handleAddToCart}
                  startIcon={<ShoppingCartIcon />}
                  sx={{ px: 4, py: 1 }}
                >
                  {isCheckingAvailability ? 'Checking...' : 'Add to Cart'}
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          {error && <Message variant="error" title="Error">{error}</Message>}
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About {plateInfo.title} Plates
              </Typography>
              
              <Typography variant="body1" paragraph>
                {plateInfo.description}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Guidelines for {plateInfo.title} Plates:
              </Typography>
              
              {plateType === 'special' && (
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li">Must contain at least two zeros (00)</Typography>
                  <Typography component="li">Maximum of 7 characters total</Typography>
                  <Typography component="li">Kenyan flag and QR code on the left side</Typography>
                </Box>
              )}
              
              {plateType === 'standard_custom' && (
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li">Must be 4-7 characters long</Typography>
                  <Typography component="li">Can include letters, numbers, and heart emoji (❤)</Typography>
                  <Typography component="li">Kenyan flag and QR code on the left side</Typography>
                </Box>
              )}
              
              {plateType === 'prestige' && (
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li">Must be 4-7 characters long</Typography>
                  <Typography component="li">Features beautiful Kenyan landscape backgrounds</Typography>
                  <Typography component="li">Kenyan flag and QR code on the left side</Typography>
                  <Typography component="li">Subject to NTSA approval for appropriateness</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <img 
          src="/src/assets/car-preview.jpg" 
          alt="Car with custom plate" 
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }} 
        />
      </Box>
    </Box>
  );
};

export default CustomizePlateForm;