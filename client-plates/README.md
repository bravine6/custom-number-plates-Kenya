# NTSA Plates UI

Frontend UI for the NTSA Custom License Plates ordering system.

## Features

- Modern React interface with Material UI
- Live plate customization and preview
- Shopping cart and checkout flow
- User authentication and profile management
- Order tracking and history
- Responsive design for mobile and desktop

## Pages

1. **Hero/Landing** – Pick plate tier, CTA to customize
2. **How It Works** – Process explanation with illustrations
3. **Plate Types** – Three product tiers with details
4. **Customize** – Live plate renderer, price display
5. **Cart** – Line items, shipping options
6. **Checkout** – Personal info form + payment options
7. **Order Success** – Confirmation and next steps
8. **User Authentication** – Login and registration
9. **Profile** – Personal information and order history

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000 and will proxy API requests to http://localhost:9000.

## Building for Production

```bash
npm run build
```

The built application will be in the `dist` directory.

## Technology Stack

- React 18
- Vite
- React Router
- Material UI
- Axios for API calls
- Formik + Yup for form management
- React Context for state management

## Development

The application proxies API requests to the backend server. Make sure the backend is running at http://localhost:9000 or update the proxy configuration in `vite.config.js`.

## License

MIT