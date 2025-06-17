const asyncHandler = require('express-async-handler');
const { Order, OrderItem, Plate } = require('../models');
const { sequelize } = require('../config/db');

// Helper function to get price based on plate type
const getPriceForPlateType = (plateType) => {
  switch (plateType) {
    case 'special':
      return 20000; // KES 20,000
    case 'standard_custom':
      return 40000; // KES 40,000
    case 'prestige':
      return 80000; // KES 80,000
    default:
      return 20000; // Default price
  }
};

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingMethod, address, city, phoneNumber } = req.body;
  
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }
  
  // Start a transaction
  const t = await sequelize.transaction();
  
  try {
    // Calculate total amount
    let totalAmount = 0;
    let shippingCost = 0;
    
    // Set shipping cost based on method
    if (shippingMethod === 'express') {
      shippingCost = 500; // KES 500
    }
    
    // Create order
    const order = await Order.create({
      userId: req.user.id,
      shippingMethod: shippingMethod || 'free',
      shippingCost,
      status: 'pending',
      address,
      city,
      phoneNumber,
      totalAmount: 0, // Will update after adding items
    }, { transaction: t });
    
    // Create order items
    for (const item of items) {
      let plate;
      
      // Check if plateId is a UUID or a temporary ID (format: type-text-timestamp)
      if (item.plateId && (item.plateId.includes('-') && item.plateId.length > 30)) {
        // It's a UUID, try to find the plate
        plate = await Plate.findByPk(item.plateId, { transaction: t });
      } else if (item.plateText && item.plateType) {
        // It's a custom plate with text and type
        // First check if this plate text already exists
        const existingPlate = await Plate.findOne({
          where: { text: item.plateText },
          transaction: t
        });
        
        if (existingPlate && !existingPlate.isAvailable) {
          throw new Error(`Plate ${item.plateText} is no longer available`);
        }
        
        if (existingPlate) {
          plate = existingPlate;
        } else {
          // Create a new plate on the fly
          plate = await Plate.create({
            plateType: item.plateType,
            text: item.plateText,
            price: item.price || getPriceForPlateType(item.plateType),
            previewUrl: item.previewUrl || null,
            description: `Custom plate order: ${item.plateText}`,
            backgroundIndex: item.backgroundIndex || null,
            isAvailable: true, // We'll mark it as unavailable after creating the order item
          }, { transaction: t });
        }
      } else {
        // Try to extract plate details from the temporary ID
        if (item.plateId && typeof item.plateId === 'string') {
          const parts = item.plateId.split('-');
          if (parts.length >= 2) {
            const plateType = parts[0];
            const plateText = parts[1];
            
            // Check if this plate text already exists
            const existingPlate = await Plate.findOne({
              where: { text: plateText },
              transaction: t
            });
            
            if (existingPlate && !existingPlate.isAvailable) {
              throw new Error(`Plate ${plateText} is no longer available`);
            }
            
            if (existingPlate) {
              plate = existingPlate;
            } else {
              // Create a new plate on the fly
              plate = await Plate.create({
                plateType: plateType,
                text: plateText,
                price: getPriceForPlateType(plateType),
                previewUrl: null,
                description: `Custom plate order: ${plateText}`,
                backgroundIndex: item.backgroundIndex || null,
                isAvailable: true, // We'll mark it as unavailable after creating the order item
              }, { transaction: t });
            }
          } else {
            throw new Error(`Invalid plate ID format: ${item.plateId}`);
          }
        } else {
          throw new Error(`Plate information missing for item`);
        }
      }
      
      if (!plate) {
        throw new Error(`Could not find or create plate for ${JSON.stringify(item)}`);
      }
      
      const itemPrice = plate.price;
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;
      
      await OrderItem.create({
        orderId: order.id,
        plateId: plate.id,
        quantity: item.quantity,
        price: itemPrice,
        plateText: plate.text,
        plateType: plate.plateType,
        previewUrl: plate.previewUrl,
        backgroundIndex: item.backgroundIndex || null,
      }, { transaction: t });
      
      // Mark plate as unavailable
      plate.isAvailable = false;
      await plate.save({ transaction: t });
    }
    
    // Update order with total amount
    order.totalAmount = totalAmount + shippingCost;
    await order.save({ transaction: t });
    
    // Commit transaction
    await t.commit();
    
    res.status(201).json({
      success: true,
      order,
      paymentUrl: `/payment/${order.id}`, // In a real app, this would be a payment gateway URL
    });
  } catch (error) {
    // Rollback transaction on error
    await t.rollback();
    res.status(400);
    throw error;
  }
});

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: OrderItem }],
  });
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Check if user is owner of order or admin
  if (order.userId !== req.user.id && !req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized to access this order');
  }
  
  res.json(order);
});

// @desc    Get logged in user orders
// @route   GET /api/v1/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: { userId: req.user.id },
    order: [['createdAt', 'DESC']],
  });
  
  res.json(orders);
});

// @desc    Update order to paid
// @route   PUT /api/v1/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const { paymentMethod, paymentId } = req.body;
  
  const order = await Order.findByPk(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  // Check if user is owner of order
  if (order.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this order');
  }
  
  order.paymentMethod = paymentMethod;
  order.paymentId = paymentId;
  order.status = 'payment_completed';
  
  const updatedOrder = await order.save();
  
  res.json(updatedOrder);
});

// @desc    Get all orders (admin only)
// @route   GET /api/v1/orders/admin
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    include: [{ model: OrderItem }],
    order: [['createdAt', 'DESC']],
  });
  
  res.json(orders);
});

// @desc    Update order status (admin only)
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const order = await Order.findByPk(req.params.id);
  
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  
  order.status = status;
  await order.save();
  
  res.json(order);
});

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  updateOrderToPaid,
  getOrders,
  updateOrderStatus,
};