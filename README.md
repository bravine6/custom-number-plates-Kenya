# NTSA Custom Plates - Kenya

A full-stack web application for ordering custom license plates from the National Transport and Safety Authority (NTSA) Kenya. This project allows users to select plate types, customize plate text, preview the plate, and place orders with secure payment options.

## Project Structure

This project uses a split-repo pattern with two main components:

1. **server-plates** - Node.js + Express API backend
2. **client-plates** - React (Vite) frontend

## Features

- User authentication and profile management
- Three plate tiers: Special Number, Standard Custom, and Prestige Custom
- Live plate preview and customization
- Shopping cart functionality
- Multiple shipping options (Standard, Express, Pick-up)
- Checkout with M-Pesa and card payment options
- Order tracking and history

## Technology Stack

### Back-end (server-plates)

- **Node.js (v18)** - JavaScript runtime
- **Express** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **JSON Web Token (JWT)** - Authentication
- **bcryptjs** - Password hashing

### Front-end (client-plates)

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Material-UI** - Component library
- **Axios** - HTTP client
- **Formik** - Form handling
- **Yup** - Form validation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- PostgreSQL database

### Installation

1. Clone the repositories:

```bash
# Clone the API repository
git clone <your-repo-url>/ntsa-plates-api.git server-plates

# Clone the UI repository
git clone <your-repo-url>/ntsa-plates-ui.git client-plates
```

2. Set up the server:

```bash
cd server-plates

# Install dependencies
npm install

# Set up environment variables (copy from .env.sample)
cp .env.sample .env
# Edit the .env file with your database credentials

# Run database migrations (if applicable)
# npm run migrate

# Start the server in development mode
npm run dev
```

3. Set up the client:

```bash
cd client-plates

# Install dependencies
npm install

# Start the development server
npm run dev
```

4. Running both concurrently:

```bash
# From the project root
concurrently \
  "npm --prefix server-plates run dev" \
  "npm --prefix client-plates run dev"
```

## Environment Variables

### Server (.env)

```
PORT=9000
NODE_ENV=development
DATABASE_URL=postgres://username:password@localhost:5432/ntsa_plates
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
```

## API Endpoints

### Plates

- `GET /api/v1/plates` - List all plates (with optional type filter)
- `POST /api/v1/plates/preview` - Generate plate preview
- `POST /api/v1/plates` - Create new plate (admin)
- `GET /api/v1/plates/:id` - Get plate by ID
- `PUT /api/v1/plates/:id` - Update plate (admin)
- `DELETE /api/v1/plates/:id` - Delete plate (admin)

### Orders

- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - Get user's orders
- `GET /api/v1/orders/:id` - Get order by ID
- `PUT /api/v1/orders/:id/pay` - Update order to paid
- `GET /api/v1/orders/admin` - Get all orders (admin)
- `PUT /api/v1/orders/:id/status` - Update order status (admin)

### Users

- `POST /api/v1/users` - Register user
- `POST /api/v1/users/login` - Login user
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users` - Get all users (admin)

## License

MIT

## Acknowledgements

This project is a demonstration of a custom license plate ordering system inspired by similar services worldwide. It is not officially affiliated with NTSA Kenya.