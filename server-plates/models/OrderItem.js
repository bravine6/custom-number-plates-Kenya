const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'orders',  // Changed to lowercase to match our tableName setting
      key: 'id',
    },
  },
  plateId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'plates',  // Changed to lowercase to match our tableName setting
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1,
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isNumeric: true,
    },
  },
  plateText: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  plateType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  previewUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  backgroundIndex: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'orderitems',  // Explicitly set table name to lowercase
});

module.exports = OrderItem;