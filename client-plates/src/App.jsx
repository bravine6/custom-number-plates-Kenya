import { Routes, Route } from 'react-router-dom'
import { Container } from '@mui/material'

// Pages
import HomePage from './pages/HomePage'
import HowItWorksPage from './pages/HowItWorksPage'
import PlateTypesPage from './pages/PlateTypesPage'
import CustomizePlateForm from './pages/CustomizePlateForm'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderSuccessPage from './pages/OrderSuccessPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

// Components
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/routing/ProtectedRoute'

function App() {
  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ pt: 3, pb: 5, minHeight: 'calc(100vh - 120px)' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/plate-types" element={<PlateTypesPage />} />
          <Route path="/customize/:plateType" element={<CustomizePlateForm />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/order-success/:orderId" element={<ProtectedRoute><OrderSuccessPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Container>
      <Footer />
    </>
  )
}

export default App