import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Grid,
  TextField,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useCart } from '../../contexts/CartContext';
import PlateRenderer from '../plates/PlateRenderer';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const [qty, setQty] = useState(item.quantity);
  
  const handleQuantityChange = (event) => {
    const newValue = parseInt(event.target.value) || 1;
    setQty(newValue);
    updateQuantity(item.plateId, newValue);
  };
  
  const incrementQuantity = () => {
    const newQty = qty + 1;
    setQty(newQty);
    updateQuantity(item.plateId, newQty);
  };
  
  const decrementQuantity = () => {
    if (qty > 1) {
      const newQty = qty - 1;
      setQty(newQty);
      updateQuantity(item.plateId, newQty);
    }
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const plateTypeLabel = {
    'special': 'Special Number',
    'standard_custom': 'Standard Custom',
    'prestige': 'Prestige Custom',
  };
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <Box display="flex" alignItems="center">
              <PlateRenderer 
                plateType={item.plateType} 
                text={item.plateText} 
                small 
                bgIndex={item.backgroundIndex}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={7}>
            <Typography variant="subtitle1" fontWeight="bold">
              {plateTypeLabel[item.plateType]} Plate
            </Typography>
            
            <Typography variant="body2" color="text.secondary">
              {item.plateText}
              {item.plateType === 'prestige' && item.backgroundIndex && (
                <span> • Background: {
                  item.backgroundIndex === 1 ? 'Mt. Kenya' : 
                  item.backgroundIndex === 2 ? 'Wildlife' : 
                  'Nairobi'
                }</span>
              )}
            </Typography>
            
            <Divider sx={{ my: 1 }} />
            
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center">
                <IconButton size="small" onClick={decrementQuantity}>
                  <RemoveIcon fontSize="small" />
                </IconButton>
                
                <TextField
                  size="small"
                  value={qty}
                  onChange={handleQuantityChange}
                  inputProps={{ min: 1, style: { textAlign: 'center' } }}
                  sx={{ width: '50px', mx: 1 }}
                />
                
                <IconButton size="small" onClick={incrementQuantity}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Box>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  {formatPrice(item.price * item.quantity)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatPrice(item.price)} each
                </Typography>
              </Box>
            </Box>
            
            <Box display="flex" justifyContent="flex-end" mt={1}>
              <IconButton 
                color="error" 
                onClick={() => removeFromCart(item.plateId)}
                size="small"
                sx={{ ml: 'auto' }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default CartItem;