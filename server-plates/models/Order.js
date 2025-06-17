const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users', // Changed to lowercase to match our tableName setting
      key: 'id',
    },
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isNumeric: true,
    },
  },
  shippingMethod: {
    type: DataTypes.ENUM('free', 'express', 'pickup'),
    allowNull: false,
    defaultValue: 'free',
  },
  shippingCost: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    validate: {
      isNumeric: true,
    },
  },
  status: {
    type: DataTypes.ENUM(
      'pending', 
      'payment_initiated', 
      'payment_completed', 
      'processing', 
      'shipped', 
      'delivered', 
      'cancelled'
    ),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.ENUM('card', 'mpesa'),
    allowNull: true,
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'orders',  // Explicitly set table name to lowercase
});

// Calculate shipping cost based on method
Order.beforeValidate(async (order) => {
  if (order.shippingMethod === 'express') {
    order.shippingCost = 500; // KES 500 for express shipping
  } else {
    order.shippingCost = 0; // Free for standard shipping or pickup
  }
});

module.exports = Order;