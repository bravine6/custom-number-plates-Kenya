const dotenv = require('dotenv');
dotenv.config();

// Check which database mode we're using
const useSupabaseRest = process.env.USE_SUPABASE_REST === 'true';

// Import models
const User = require('./User');
const Plate = require('./Plate');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Only define relationships if using Sequelize (not Supabase REST)
if (!useSupabaseRest) {
  try {
    // Define relationships
    User.hasMany(Order, { foreignKey: 'userId' });
    Order.belongsTo(User, { foreignKey: 'userId' });

    Order.hasMany(OrderItem, { foreignKey: 'orderId' });
    OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

    Plate.hasMany(OrderItem, { foreignKey: 'plateId' });
    OrderItem.belongsTo(Plate, { foreignKey: 'plateId' });
  } catch (error) {
    console.log('Skipping model relationships:', error.message);
  }
}

module.exports = {
  User,
  Plate,
  Order,
  OrderItem,
};