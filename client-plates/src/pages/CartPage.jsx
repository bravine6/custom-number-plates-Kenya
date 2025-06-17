import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Divider,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  Card,
  CardContent,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import CartItem from '../components/cart/CartItem';
import Message from '../components/ui/Message';

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, shippingMethod, setShippingMethod, getCartTotals } = useCart();
  const { isAuthenticated } = useAuth();
  
  const { subtotal, shippingCost, total } = getCartTotals();
  
  const handleShippingChange = (e) => {
    setShippingMethod(e.target.value);
  };
  
  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login?redirect=checkout');
    }
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
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Your Cart
      </Typography>
      
      {cartItems.length === 0 ? (
        <Message>
          Your cart is empty. <Button color="primary" onClick={() => navigate('/plate-types')}>Continue Shopping</Button>
        </Message>
      ) : (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            {cartItems.map((item) => (
              <CartItem key={item.plateId} item={item} />
            ))}
            
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/plate-types')}
                sx={{ mr: 2 }}
              >
                Continue Shopping
              </Button>
            </Box>
          </Grid>
          
          {/* Order Summary */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
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
                      <Typography variant="body1" fontWeight="bold">
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
                
                <Grid container spacing={1} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <Typography variant="h6">Total</Typography>
                  </Grid>
                  <Grid item xs={6} sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {formatPrice(total)}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
                  Shipping Method
                </Typography>
                
                <FormControl component="fieldset">
                  <RadioGroup
                    name="shipping-method"
                    value={shippingMethod}
                    onChange={handleShippingChange}
                  >
                    <FormControlLabel
                      value="free"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocalShippingIcon sx={{ mr: 1, fontSize: 20 }} />
                          <Typography>Standard Shipping (Free)</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="express"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocalShippingIcon sx={{ mr: 1, fontSize: 20 }} />
                          <Typography>Express Shipping (+KES 500)</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="pickup"
                      control={<Radio />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StorefrontIcon sx={{ mr: 1, fontSize: 20 }} />
                          <Typography>Pick-up at NTSA Office (Free)</Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
                
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default CartPage;