const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Plate = sequelize.define('Plate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  plateType: {
    type: DataTypes.ENUM('special', 'standard_custom', 'prestige'),
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 7], // Most Kenyan plates are limited to 7 characters
    },
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isNumeric: true,
    },
  },
  previewUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  backgroundIndex: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: 'plates',  // Explicitly set table name to lowercase
});

// Set default prices based on plate type
Plate.beforeValidate(async (plate) => {
  if (!plate.price) {
    switch (plate.plateType) {
      case 'special':
        plate.price = 20000; // KES 20,000
        break;
      case 'standard_custom':
        plate.price = 40000; // KES 40,000
        break;
      case 'prestige':
        plate.price = 80000; // KES 80,000
        break;
      default:
        plate.price = 0;
    }
  }
});

module.exports = Plate;