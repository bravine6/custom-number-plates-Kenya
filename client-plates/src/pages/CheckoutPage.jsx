import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Paper,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Select,
  InputLabel,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import CartItem from '../components/cart/CartItem';
import Message from '../components/ui/Message';
import Loader from '../components/ui/Loader';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder, updateOrderToPaid } from '../services/orderService';

// List of Huduma Centers in Kenya
const hudumaCenters = [
  { id: 'nairobi-gpo', name: 'Nairobi GPO' },
  { id: 'nairobi-city-square', name: 'Nairobi City Square' },
  { id: 'kisumu', name: 'Kisumu Huduma Center' },
  { id: 'mombasa', name: 'Mombasa Huduma Center' },
  { id: 'nakuru', name: 'Nakuru Huduma Center' },
  { id: 'eldoret', name: 'Eldoret Huduma Center' },
  { id: 'nyeri', name: 'Nyeri Huduma Center' },
  { id: 'kakamega', name: 'Kakamega Huduma Center' },
  { id: 'kisii', name: 'Kisii Huduma Center' },
  { id: 'machakos', name: 'Machakos Huduma Center' },
  { id: 'embu', name: 'Embu Huduma Center' },
  { id: 'garissa', name: 'Garissa Huduma Center' },
  { id: 'kitui', name: 'Kitui Huduma Center' },
  { id: 'bungoma', name: 'Bungoma Huduma Center' },
  { id: 'meru', name: 'Meru Huduma Center' },
  { id: 'thika', name: 'Thika Huduma Center' },
  { id: 'isiolo', name: 'Isiolo Huduma Center' },
  { id: 'kajiado', name: 'Kajiado Huduma Center' },
  { id: 'kiambu', name: 'Kiambu Huduma Center' },
  { id: 'kericho', name: 'Kericho Huduma Center' },
  { id: 'muranga', name: 'Murang\'a Huduma Center' },
  { id: 'narok', name: 'Narok Huduma Center' },
  { id: 'nyahururu', name: 'Nyahururu Huduma Center' },
  { id: 'kilifi', name: 'Kilifi Huduma Center' },
  { id: 'kwale', name: 'Kwale Huduma Center' },
  { id: 'lamu', name: 'Lamu Huduma Center' },
  { id: 'malindi', name: 'Malindi Huduma Center' },
  { id: 'taita-taveta', name: 'Taita Taveta Huduma Center' },
  { id: 'tana-river', name: 'Tana River Huduma Center' },
  { id: 'wajir', name: 'Wajir Huduma Center' },
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, shippingMethod, getCartTotals, clearCart } = useCart();
  
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { subtotal, shippingCost, total } = getCartTotals();
  
  // Redirect if cart is empty
  if (!cartItems.length) {
    navigate('/cart');
    return null;
  }
  
  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    phone: Yup.string().required('Phone number is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    idNumber: Yup.string().required('ID number is required'),
    hudumaCenterLocation: Yup.string().required('Please select a Huduma Center for pickup'),
  });
  
  // Initialize form with user data
  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      idNumber: user?.idNumber || '',
      hudumaCenterLocation: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      
      try {
        // Create order data
        const orderData = {
          items: cartItems.map(item => ({
            plateId: item.plateId,
            plateText: item.plateText,
            plateType: item.plateType,
            price: item.price,
            backgroundIndex: item.backgroundIndex,
            quantity: item.quantity,
          })),
          shippingMethod,
          address: values.hudumaCenterLocation, // Use the Huduma Center location as the address
          phoneNumber: values.phone,
          paymentMethod,
        };
        
        // Send order to API
        const response = await createOrder(orderData);
        
        // For testing purposes, automatically mark the order as paid
        // In a real app, this would happen after payment gateway response
        try {
          // Skip actual payment for testing
          const paymentResult = {
            paymentMethod: paymentMethod,
            paymentId: `test_payment_${Date.now()}`,
          };
          
          // Update the order to paid status (would normally happen after payment gateway confirmation)
          await updateOrderToPaid(response.order.id, paymentResult);
        } catch (error) {
          console.log('Auto-payment simulation error:', error);
          // Continue anyway since this is just for testing
        }
        
        // Clear cart after successful order
        clearCart();
        
        // Redirect to success page
        navigate(`/order-success/${response.order.id}`);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to place order. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  const steps = ['Personal Information', 'Payment Method', 'Place Order'];
  
  const handleNext = () => {
    if (activeStep === 0 && !formik.isValid) {
      formik.validateForm();
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
    
    if (activeStep === steps.length - 1) {
      formik.handleSubmit();
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };
  
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Checkout
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {loading ? (
        <Loader message="Processing your order..." />
      ) : error ? (
        <Message variant="error" title="Error">{error}</Message>
      ) : (
        <Grid container spacing={4}>
          {/* Checkout Form */}
          <Grid item xs={12} md={8}>
            {activeStep === 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Personal Information
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="name"
                        name="name"
                        label="Full Name"
                        variant="outlined"
                        margin="normal"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="phone"
                        name="phone"
                        label="Phone Number"
                        variant="outlined"
                        margin="normal"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="email"
                        name="email"
                        label="Email Address"
                        variant="outlined"
                        margin="normal"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        error={formik.touched.email && Boolean(formik.errors.email)}
                        helperText={formik.touched.email && formik.errors.email}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="idNumber"
                        name="idNumber"
                        label="ID Number"
                        variant="outlined"
                        margin="normal"
                        value={formik.values.idNumber}
                        onChange={formik.handleChange}
                        error={formik.touched.idNumber && Boolean(formik.errors.idNumber)}
                        helperText={formik.touched.idNumber && formik.errors.idNumber}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl 
                        fullWidth 
                        margin="normal"
                        error={formik.touched.hudumaCenterLocation && Boolean(formik.errors.hudumaCenterLocation)}
                      >
                        <InputLabel id="huduma-center-label">Huduma Center Location for Pickup</InputLabel>
                        <Select
                          labelId="huduma-center-label"
                          id="hudumaCenterLocation"
                          name="hudumaCenterLocation"
                          value={formik.values.hudumaCenterLocation}
                          onChange={formik.handleChange}
                          label="Huduma Center Location for Pickup"
                        >
                          {hudumaCenters.map((center) => (
                            <MenuItem key={center.id} value={center.id}>
                              {center.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {formik.touched.hudumaCenterLocation && formik.errors.hudumaCenterLocation && (
                          <Typography variant="caption" color="error">
                            {formik.errors.hudumaCenterLocation}
                          </Typography>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
            
            {activeStep === 1 && (
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Payment Method
                  </Typography>
                  
                  <FormControl component="fieldset" sx={{ mt: 2 }}>
                    <RadioGroup
                      name="payment-method"
                      value={paymentMethod}
                      onChange={handlePaymentMethodChange}
                    >
                      <FormControlLabel
                        value="mpesa"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneAndroidIcon sx={{ mr: 1 }} />
                            <Typography>M-Pesa</Typography>
                          </Box>
                        }
                        sx={{ mb: 2 }}
                      />
                      
                      <Box sx={{ ml: 4, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Pay directly with your M-Pesa mobile money account.
                          You will receive a prompt on your phone to complete the transaction.
                        </Typography>
                      </Box>
                      
                      <FormControlLabel
                        value="card"
                        control={<Radio />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CreditCardIcon sx={{ mr: 1 }} />
                            <Typography>Credit/Debit Card</Typography>
                          </Box>
                        }
                      />
                      
                      <Box sx={{ ml: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          Pay securely with your credit or debit card.
                          We accept Visa, Mastercard, and American Express.
                        </Typography>
                      </Box>
                    </RadioGroup>
                  </FormControl>
                </CardContent>
              </Card>
            )}
            
            {activeStep === 2 && (
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Order Review
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Personal Information
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {formik.values.name}
                      </Typography>
                      <Typography variant="body2">
                        <strong>Email:</strong> {formik.values.email}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Phone:</strong> {formik.values.phone}
                      </Typography>
                      <Typography variant="body2">
                        <strong>ID Number:</strong> {formik.values.idNumber}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Pickup Information
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        <strong>Pickup Location:</strong> {
                          formik.values.hudumaCenterLocation ? 
                          hudumaCenters.find(center => center.id === formik.values.hudumaCenterLocation)?.name : 
                          'Not selected'
                        }
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Payment Method
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 3 }}>
                    <strong>Payment via:</strong> {paymentMethod === 'mpesa' ? 'M-Pesa' : 'Credit/Debit Card'}
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Order Items
                  </Typography>
                  
                  {cartItems.map((item) => (
                    <Box key={item.plateId} sx={{ mb: 2 }}>
                      <Typography>
                        {item.quantity}x {item.plateText} ({item.plateType.replace('_', ' ')})
                        - {formatPrice(item.price * item.quantity)}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={activeStep === 0 ? () => navigate('/cart') : handleBack}
                sx={{ mr: 1 }}
              >
                {activeStep === 0 ? 'Back to Cart' : 'Back'}
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
              </Button>
            </Box>
          </Grid>
          
          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Order Summary
                </Typography>
                
                <Box sx={{ my: 2 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body1">Subtotal</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body1">
                        {formatPrice(subtotal)}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body1">Shipping</Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'right' }}>
                      <Typography variant="body1">
                        {shippingCost > 0 ? formatPrice(shippingCost) : 'Free'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="h6">Total</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {formatPrice(total)}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  By completing your purchase, you agree to NTSA's terms and conditions.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Items in Cart
                </Typography>
                
                {cartItems.map((item) => (
                  <Box key={item.plateId} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {item.quantity}x {item.plateText}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CheckoutPage;