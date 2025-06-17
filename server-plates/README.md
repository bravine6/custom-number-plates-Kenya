# NTSA Plates API

Backend API for the NTSA Custom License Plates ordering system.

## Features

- Complete REST API for license plate ordering system
- JWT Authentication
- PostgreSQL database with Sequelize ORM
- User, Plate and Order management

## API Routes

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

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.sample .env
# Edit the .env file with your database credentials
```

3. Start the development server:

```bash
npm run dev
```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run tests

## Technologies

- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT Authentication
- bcrypt

## License

MIT