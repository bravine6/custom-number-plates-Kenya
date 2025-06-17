import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  TextField,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SaveIcon from '@mui/icons-material/Save';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import Message from '../components/ui/Message';
import Loader from '../components/ui/Loader';
import { getMyOrders } from '../services/orderService';

// Status chip color mapping
const statusColorMap = {
  'pending': 'warning',
  'payment_initiated': 'info',
  'payment_completed': 'info',
  'processing': 'info',
  'shipped': 'success',
  'delivered': 'success',
  'cancelled': 'error',
};

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load user's orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real app, this would fetch orders from the API
        // For this demo, we'll create mock orders
        
        // Uncomment for real API integration
        // const data = await getMyOrders();
        // setOrders(data);
        
        // Mock data for demo
        setOrders([
          {
            id: '1234abcd',
            createdAt: new Date().toISOString(),
            totalAmount: 40500,
            status: 'pending',
            shippingMethod: 'express',
            items: [
              { plateText: 'KAA123', plateType: 'special', quantity: 1 }
            ],
          },
          {
            id: '5678efgh',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            totalAmount: 40000,
            status: 'payment_completed',
            shippingMethod: 'free',
            items: [
              { plateText: 'KBB456', plateType: 'standard_custom', quantity: 1 }
            ],
          },
        ]);
      } catch (error) {
        setError('Failed to load your orders');
      } finally {
        setOrdersLoading(false);
      }
    };
    
    if (tabValue === 1) {
      fetchOrders();
    }
  }, [tabValue]);
  
  // Validation schema for profile form
  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters'),
  });
  
  // Initialize form with user data
  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError(null);
      
      try {
        // Only include password if it was updated
        const updateData = { ...values };
        if (!updateData.password) {
          delete updateData.password;
        }
        
        await updateProfile(updateData);
        
        setShowPassword(false);
        
        // Reset password field
        formik.setFieldValue('password', '');
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    },
  });
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        My Profile
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Profile Information" />
          <Tab label="My Orders" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardContent>
              {error && <Message variant="error">{error}</Message>}
              
              <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      label="Full Name"
                      variant="outlined"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      error={formik.touched.name && Boolean(formik.errors.name)}
                      helperText={formik.touched.name && formik.errors.name}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      variant="outlined"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      error={formik.touched.email && Boolean(formik.errors.email)}
                      helperText={formik.touched.email && formik.errors.email}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="phone"
                      name="phone"
                      label="Phone Number"
                      variant="outlined"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      error={formik.touched.phone && Boolean(formik.errors.phone)}
                      helperText={formik.touched.phone && formik.errors.phone}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="address"
                      name="address"
                      label="Address"
                      variant="outlined"
                      value={formik.values.address}
                      onChange={formik.handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="city"
                      name="city"
                      label="City"
                      variant="outlined"
                      value={formik.values.city}
                      onChange={formik.handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Update Password
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Leave blank if you don't want to change your password
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="password"
                      name="password"
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      error={formik.touched.password && Boolean(formik.errors.password)}
                      helperText={formik.touched.password && formik.errors.password}
                      disabled={loading}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={toggleShowPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={loading}
                      startIcon={<SaveIcon />}
                      sx={{ mt: 2 }}
                    >
                      {loading ? 'Saving...' : 'Update Profile'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {ordersLoading ? (
            <Loader message="Loading your orders..." />
          ) : error ? (
            <Message variant="error">{error}</Message>
          ) : orders.length === 0 ? (
            <Message>
              You haven't placed any orders yet.
              <Button
                color="primary"
                onClick={() => navigate('/plate-types')}
                sx={{ ml: 2 }}
              >
                Shop Now
              </Button>
            </Message>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell><Typography fontWeight="bold">Order ID</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Date</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Total</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Status</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Items</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Actions</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>#{order.id.substring(0, 8)}</TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>{formatPrice(order.totalAmount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status.replace('_', ' ').toUpperCase()}
                          color={statusColorMap[order.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {order.items.map((item, index) => (
                          <Typography key={index} variant="body2" component="div">
                            {item.quantity}x {item.plateText}
                          </Typography>
                        ))}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/order-success/${order.id}`)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>
      </Paper>
      
      <Box sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={logout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default ProfilePage;