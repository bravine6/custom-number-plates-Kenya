import { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Grid,
  Card,
  CardContent,
  Container,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HomeIcon from '@mui/icons-material/Home';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PlateRenderer from '../components/plates/PlateRenderer';
import Message from '../components/ui/Message';
import Loader from '../components/ui/Loader';
import { getOrderById } from '../services/orderService';

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Fetch the order details from the API
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (error) {
        console.error('Order fetch error:', error);
        // Fallback to mock data if there's an error
        setOrder({
          id: orderId,
          totalAmount: 40500,
          status: 'payment_completed', // Default to completed for testing
          paymentMethod: 'mpesa',
          shippingMethod: 'pickup',
          address: 'Nairobi GPO Huduma Center', // Default huduma center
        });
        setError('Using mock data. In production, this would fetch from the API.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [orderId]);
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  if (loading) return <Loader message="Loading order details..." />;
  
  if (error) return <Message variant="error" title="Error">{error}</Message>;
  
  // Extract plate details from the order if available
  const getPlateDetails = () => {
    if (order && order.OrderItems && order.OrderItems.length > 0) {
      return order.OrderItems[0]; // Assuming the first item is the plate
    }
    
    // Fallback data
    return {
      plateText: order?.items?.[0]?.plateText || 'CUSTOM',
      plateType: order?.items?.[0]?.plateType || 'prestige',
      backgroundIndex: order?.items?.[0]?.backgroundIndex || undefined,
    };
  };
  
  const plateDetails = getPlateDetails();
  
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <EmojiEventsIcon color="success" sx={{ fontSize: 80 }} />
        </Box>
        
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Congratulations!
        </Typography>
        
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
          Your custom plate has been reserved successfully. Your plate is now exclusively yours!
        </Typography>
        
        {/* Plate Preview */}
        <Box sx={{ mb: 5, mt: 5 }}>
          <Paper 
            elevation={6} 
            sx={{ 
              p: 5, 
              maxWidth: '700px', 
              mx: 'auto',
              backgroundColor: '#f8f9fa',
              borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3 }}>
              Your Reserved Custom Plate
            </Typography>
            
            <Box sx={{ maxWidth: '500px', mx: 'auto', transform: 'scale(1.2)', mb: 3 }}>
              <PlateRenderer 
                plateType={plateDetails.plateType} 
                text={plateDetails.plateText}
                bgIndex={plateDetails.backgroundIndex}
              />
            </Box>
            
            <Typography variant="body1" color="text.secondary" sx={{ mt: 4, fontStyle: 'italic' }}>
              This plate design is now reserved for you and cannot be selected by anyone else.
            </Typography>
          </Paper>
        </Box>
        
        {/* Order Details */}
        <Card sx={{ maxWidth: '500px', mx: 'auto', mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2} sx={{ textAlign: 'left' }}>
              <Grid item xs={6}>
                <Typography variant="body1">Order Number:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body1" fontWeight="bold">#{order.id.substring(0, 8)}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body1">Total Amount:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body1" fontWeight="bold">{formatPrice(order.totalAmount)}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body1">Payment Method:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body1">{order.paymentMethod === 'mpesa' ? 'M-Pesa' : 'Credit/Debit Card'}</Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body1">Pickup Location:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography variant="body1">
                  {order.address || 'Huduma Center (as selected)'}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body1">Status:</Typography>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'success.main',
                    fontWeight: 'bold',
                  }}
                >
                  Completed
                </Typography>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Message variant="success">
                Your custom plate has been confirmed and reserved! It will be ready for pickup in 7-14 business days.
              </Message>
            </Box>
          </CardContent>
        </Card>
        
        {/* Next Steps */}
        <Paper sx={{ p: 3, maxWidth: '600px', mx: 'auto', mb: 4, backgroundColor: '#f0f7ff' }}>
          <Typography variant="h6" gutterBottom>
            Next Steps:
          </Typography>
          
          <Typography variant="body1" paragraph align="left">
            1. We will process your plate application with NTSA.
          </Typography>
          
          <Typography variant="body1" paragraph align="left">
            2. You will receive an email notification when your plate is ready for pickup.
          </Typography>
          
          <Typography variant="body1" paragraph align="left">
            3. Bring your ID and payment confirmation to your selected Huduma Center to collect your custom plate.
          </Typography>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink}
            to="/"
            startIcon={<HomeIcon />}
            size="large"
          >
            Return to Home
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/profile"
            startIcon={<ReceiptIcon />}
            size="large"
          >
            View My Orders
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default OrderSuccessPage;