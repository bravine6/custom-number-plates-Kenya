# Custom Plates Kenya

## Project Overview

Custom Plates Kenya is a comprehensive web application that allows Kenyan citizens to order customized license plates through a streamlined digital process. The platform bridges the gap between citizens and the National Transport and Safety Authority (NTSA) by providing an intuitive interface for selecting, customizing, and ordering official license plates.

## Key Features

### 1. Plate Customization

- **Three Plate Categories**:
  - **Special Number Plates**: Format starts with capital K followed by two letters, a space, and a combination with double zeros or triple numbers, ending with a letter (e.g., KDA 007A)
  - **Standard Custom (Star) Plates**: Personalized text with 4-7 characters
  - **Premium Custom (Prestige) Plates**: Unique letter combinations with Kenyan landscape backgrounds

- **Real-time Plate Preview**:
  - Dynamic visualization of plate designs as users type
  - Background selection for Premium plates (Mt. Kenya, Wildlife, Nairobi)
  - Official styling with Kenyan flag and NTSA-compliant elements

- **Availability Checking**:
  - Real-time verification to ensure plate text is unique
  - Prevents duplicate plate registrations

### 2. User-Friendly Interface

- **Modern, Responsive Design**:
  - Works seamlessly on mobile, tablet, and desktop
  - Intuitive navigation with clear call-to-action buttons

- **Interactive Elements**:
  - Vehicle carousel on homepage showing plates on different vehicle types
  - Sample plate displays with multiple examples for each plate type

- **Step-by-Step Process**:
  - Guided journey from plate selection to checkout

### 3. Order Management

- **Secure Checkout Process**:
  - Integration with popular payment methods (M-Pesa, credit/debit cards)
  - Huduma Center selection for convenient pickup

- **Order Tracking**:
  - Confirmation page with plate visualization
  - Clear next steps for plate collection

- **User Accounts**:
  - Registration and login with secure authentication
  - Profile page for order history and status updates

## Technical Implementation

### Frontend (React + Material UI)

- **Component Architecture**:
  - Reusable components for plate rendering, forms, and UI elements
  - Context API for state management (Auth, Cart)

- **Responsive Design**:
  - Flexbox and Grid layouts
  - Material UI components with custom styling

- **Form Handling**:
  - Formik for form state management
  - Yup for validation rules

### Backend (Node.js + Express + PostgreSQL)

- **RESTful API**:
  - CRUD operations for plates, orders, and users
  - JWT authentication for secure endpoints

- **Database Models**:
  - Sequelize ORM for database interactions
  - Relationships between Users, Plates, Orders, and OrderItems

- **Business Logic**:
  - Plate reservation system
  - Availability checking
  - Order processing

### Security Features

- **Authentication**:
  - JWT-based user authentication
  - Bcrypt password hashing

- **Route Protection**:
  - Private routes for authenticated users
  - Admin routes for NTSA management

- **Data Validation**:
  - Server-side validation for all inputs
  - Client-side validation for immediate feedback

## User Journey

1. **Homepage**: User is introduced to the service with an engaging carousel and key benefits
2. **Plate Types Page**: User browses the three plate categories with multiple examples
3. **Customization**: User enters desired plate text with real-time preview and availability checking
4. **Cart**: User reviews selection before proceeding to checkout
5. **Checkout**: User provides personal information and selects a Huduma Center for pickup
6. **Payment**: User completes payment through M-Pesa or card
7. **Confirmation**: User receives confirmation with plate details and next steps

## Admin Capabilities

- **Order Management**:
  - View all orders
  - Update order status
  - Filter and search functionality

- **Plate Management**:
  - Add, edit, or remove plate types
  - Check plate availability

- **User Management**:
  - View registered users
  - Manage user accounts

## Future Enhancements

- **Mobile App**: Native applications for Android and iOS
- **SMS Notifications**: Updates on order status
- **Integration with NTSA Systems**: Direct connection to government databases
- **Advanced Analytics**: Insights on popular plate types and user demographics
- **Additional Payment Methods**: More local payment options

## Project Benefits

- **For Citizens**:
  - Convenient, paperless process for ordering custom plates
  - Transparency in pricing and availability
  - Time-saving alternative to in-person visits

- **For NTSA**:
  - Reduced administrative burden
  - Digital records of all plates
  - Streamlined distribution through Huduma Centers

- **For Kenya**:
  - Modernization of government services
  - Improved citizen experience
  - Potential revenue increase from premium plates

## Technology Stack

- **Frontend**: React, Material UI, Context API, React Router
- **Backend**: Node.js, Express, Sequelize ORM
- **Database**: PostgreSQL
- **Authentication**: JWT, Bcrypt
- **Form Handling**: Formik, Yup
- **Payment Integration**: M-Pesa API, Card payment processor

## Conclusion

Custom Plates Kenya represents a significant step forward in the digitization of government services in Kenya. By providing a user-friendly platform for custom plate ordering, the project demonstrates how technology can simplify bureaucratic processes, enhance user experience, and increase efficiency in public service delivery.

The combination of intuitive design, real-time feedback, and secure processing creates a seamless experience from selection to plate collection, setting a new standard for e-government services in Kenya.