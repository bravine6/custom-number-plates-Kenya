const User = require('./User');
const Plate = require('./Plate');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Define relationships
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Plate.hasMany(OrderItem, { foreignKey: 'plateId' });
OrderItem.belongsTo(Plate, { foreignKey: 'plateId' });

module.exports = {
  User,
  Plate,
  Order,
  OrderItem,
};