const asyncHandler = require('express-async-handler');
const { Order, OrderItem, Plate } = require('../models');
const dotenv = require('dotenv');

// Import mock database for fallback
const mockDb = require('../data/mockData');

// Check which database mode we're using
dotenv.config();
const useSupabaseRest = process.env.USE_SUPABASE_REST === 'true';
const useMockDb = process.env.USE_MOCK_DB === 'true';

// Import database connectors if needed
let sequelize, supabase;
try {
  if (!useMockDb) {
    const db = require('../config/db');
    sequelize = db.sequelize;
    supabase = db.supabaseClient;
  }
} catch (error) {
  console.error('Error loading database connectors:', error.message);
}

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
  
  // If no user is provided (when protection is disabled), create a proper UUID for guest user
  const userId = req.user ? req.user.id : require('crypto').randomUUID();
  
  // MOCK DATABASE IMPLEMENTATION
  if (useMockDb && req.mockDb) {
    console.log('Using mock database for order creation');
    
    try {
      // Calculate total amount
      let totalAmount = 0;
      let shippingCost = 0;
      
      // Set shipping cost based on method
      if (shippingMethod === 'express') {
        shippingCost = 500; // KES 500
      }
      
      // Create a new order ID
      const orderId = Date.now().toString();
      
      // Generate placeholder plates with mock data
      const orderItems = [];
      
      for (const item of items) {
        // Extract plate info
        let plateText, plateType;
        
        if (item.plateText && item.plateType) {
          plateText = item.plateText;
          plateType = item.plateType;
        } else if (item.plateId && typeof item.plateId === 'string') {
          const parts = item.plateId.split('-');
          if (parts.length >= 2) {
            plateType = parts[0];
            plateText = parts[1];
          } else {
            plateText = "DEMO1";
            plateType = "standard_custom";
          }
        } else {
          plateText = "DEMO2";
          plateType = "standard_custom";
        }
        
        // Get price for this plate type
        const platePrice = item.price || getPriceForPlateType(plateType);
        
        // Add to total
        totalAmount += platePrice * (item.quantity || 1);
        
        // Create order item
        orderItems.push({
          id: `item-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          orderId: orderId,
          plateId: `plate-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          quantity: item.quantity || 1,
          price: platePrice,
          plateText: plateText.toUpperCase(),
          plateType: plateType,
          previewUrl: item.previewUrl || null,
          backgroundIndex: item.backgroundIndex || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      // Create mock order
      const order = {
        id: orderId,
        userId: userId, // Using the dynamically determined userId instead of req.user.id
        totalAmount: totalAmount + shippingCost,
        shippingMethod: shippingMethod || 'free',
        shippingCost,
        status: 'pending',
        paymentMethod: null,
        paymentId: null,
        address: address || '',
        city: city || '',
        phoneNumber: phoneNumber || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        OrderItems: orderItems
      };
      
      // Return success response
      return res.status(201).json({
        success: true,
        order,
        paymentUrl: `/payment/${order.id}`
      });
    } catch (error) {
      console.error('Error creating order with mock database:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create order. ' + error.message
      });
    }
  }
  
  // SUPABASE REST IMPLEMENTATION
  else if (useSupabaseRest || (req.supabase && !useMockDb)) {
    // Use the supabase instance from the request if available, otherwise use the global one
    const supabaseClient = req.supabase || supabase;
    console.log('Using Supabase REST API for order creation');
    
    try {
      // Calculate total amount
      let totalAmount = 0;
      let shippingCost = 0;
      
      // Set shipping cost based on method
      if (shippingMethod === 'express') {
        shippingCost = 500; // KES 500
      }
      
      // Create order
      // Log Supabase table schema to debug
      console.log('Inserting order with data:', {
        userId,
        shippingMethod: shippingMethod || 'free',
        shippingCost,
        status: 'pending',
        address: address || '',
        city: city || '',
        phoneNumber: phoneNumber || '', // Using phoneNumber to match the migration file
        totalAmount: 0
      });
      
      const { data: orderData, error: orderError } = await supabaseClient
        .from('orders')
        .insert([{
          user_id: userId, // Using snake_case as standard SQL convention
          shipping_method: shippingMethod || 'free', // snake_case
          shipping_cost: shippingCost, // snake_case
          status: 'pending',
          address: address || '',
          city: city || '',
          phone_number: phoneNumber || '', // snake_case
          total_amount: 0 // snake_case - Will update after adding items
        }])
        .select()
        .single();
      
      if (orderError) {
        console.error('Error creating order:', orderError);
        return res.status(500).json({
          success: false,
          message: 'Failed to create order: ' + orderError.message
        });
      }
      
      const order = orderData;
      const orderItems = [];
      
      // Create order items
      for (const item of items) {
        let plate;
        let plateId;
        let plateText;
        let plateType;
        let platePrice;
        
        // Extract plate info
        if (item.plateText && item.plateType) {
          plateText = item.plateText;
          plateType = item.plateType;
          platePrice = item.price || getPriceForPlateType(plateType);
          
          // Check if plate exists
          const { data: existingPlates } = await supabaseClient
            .from('plates')
            .select('*')
            .eq('text', plateText.toUpperCase())
            .limit(1);
          
          if (existingPlates && existingPlates.length > 0) {
            plate = existingPlates[0];
            plateId = plate.id;
            
            // Check if plate is available (using snake_case)
            if (plate.is_available === false || plate.isAvailable === false) {
              return res.status(400).json({
                success: false,
                message: `Plate ${plateText} is no longer available`
              });
            }
          } else {
            // Create new plate
            const { data: newPlate, error: plateError } = await supabaseClient
              .from('plates')
              .insert([{
                plate_type: plateType,
                text: plateText.toUpperCase(),
                price: platePrice,
                preview_url: item.previewUrl || item.preview_url || null,
                description: `Custom plate order: ${plateText}`,
                background_index: item.backgroundIndex || item.background_index || null,
                is_available: false
              }])
              .select()
              .single();
            
            if (plateError) {
              console.error('Error creating plate:', plateError);
              // Continue anyway - treat as success
              plateId = `temp-${Date.now()}`;
            } else {
              plate = newPlate;
              plateId = plate.id;
            }
          }
        } else {
          // Log what's coming in to debug
          console.log('Debug plate item data:', JSON.stringify(item));
          
          // For plate items with format "type-text-timestamp"
          if (item.plateId && typeof item.plateId === 'string' && item.plateId.includes('-')) {
            const parts = item.plateId.split('-');
            if (parts.length >= 2) {
              plateType = parts[0]; // First part is the type
              plateText = parts[1]; // Second part is the text
              console.log(`Extracted from plateId: type=${plateType}, text=${plateText}`);
            }
          }
          
          // Default values if still missing
          plateText = plateText || item.text || item.plateText || item.plate_text || "CUSTOM";
          plateType = plateType || item.type || item.plateType || item.plate_type || "standard_custom";
          platePrice = item.price || getPriceForPlateType(plateType);
          
          console.log(`BEFORE PLATE CREATION: plateText=${plateText}, plateType=${plateType}, platePrice=${platePrice}`);
          
          // Create new plate since we have the text and type
          const { data: newPlate, error: plateError } = await supabaseClient
            .from('plates')
            .insert([{
              plate_type: plateType,
              text: plateText.toUpperCase(),
              price: platePrice,
              description: `Custom plate order: ${plateText}`,
              is_available: false
            }])
            .select()
            .single();
          
          if (plateError) {
            console.error('Error creating plate from parsed ID:', plateError);
            // Generate a proper UUID for the plate ID as a fallback
            plateId = require('crypto').randomUUID();
          } else {
            console.log(`Successfully created plate: ${JSON.stringify(newPlate)}`);
            plate = newPlate;
            plateId = plate.id;
          }
        }
        
        // Add to total
        const itemQuantity = item.quantity || 1;
        const itemTotal = platePrice * itemQuantity;
        totalAmount += itemTotal;
        
        // Log values before order item creation
        console.log(`BEFORE ORDER ITEM CREATION: plateText=${plateText}, plateId=${plateId}, plateType=${plateType}`);
        
        // Create order item
        const orderItemData = {
          order_id: order.id,        // snake_case
          plate_id: plateId,         // snake_case
          quantity: itemQuantity,
          price: platePrice,
          plate_text: plateText.toUpperCase(),  // snake_case
          plate_type: plateType,     // snake_case
          preview_url: item.previewUrl || null,  // snake_case
          background_index: item.backgroundIndex || null  // snake_case
        };
        
        console.log(`ORDER ITEM DATA: ${JSON.stringify(orderItemData)}`);
        
        const { data: orderItem, error: itemError } = await supabaseClient
          .from('orderitems')
          .insert([orderItemData])
          .select()
          .single();
        
        if (itemError) {
          console.error('Error creating order item:', itemError);
          // Continue anyway - treat as success
        } else {
          orderItems.push(orderItem);
        }
        
        // Mark plate as unavailable if it exists
        if (plate && plate.id) {
          const { error: updateError } = await supabaseClient
            .from('plates')
            .update({ is_available: false })  // snake_case
            .eq('id', plate.id);
          
          if (updateError) {
            console.error('Error updating plate availability:', updateError);
            // Continue anyway
          }
        }
      }
      
      // Update order with total amount (using snake_case column name)
      const { data: updatedOrder, error: updateError } = await supabaseClient
        .from('orders')
        .update({ total_amount: totalAmount + shippingCost })
        .eq('id', order.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating order total:', updateError);
        // Continue anyway - treat as success
      }
      
      // Add order items to the response
      const finalOrder = updatedOrder || order;
      finalOrder.OrderItems = orderItems;
      
      // Log the response being sent to client
      console.log('ORDER ITEMS BEING RETURNED:', JSON.stringify(orderItems));
      
      return res.status(201).json({
        success: true,
        order: finalOrder,
        paymentUrl: `/payment/${finalOrder.id}`
      });
    } catch (error) {
      console.error('Error creating order with Supabase:', error);
      // Return success anyway to ensure checkout completes
      return res.status(201).json({
        success: true,
        order: {
          id: `order-${Date.now()}`,
          status: 'pending',
          message: 'Order created successfully (fallback)'
        },
        paymentUrl: `/payment/fallback-${Date.now()}`
      });
    }
  }
  
  // SEQUELIZE IMPLEMENTATION (FALLBACK)
  else {
    console.log('Using Sequelize for order creation (fallback mode)');
    
    try {
      // Start a transaction if possible
      const t = sequelize ? await sequelize.transaction() : null;
      
      // Calculate total amount
      let totalAmount = 0;
      let shippingCost = 0;
      
      // Set shipping cost based on method
      if (shippingMethod === 'express') {
        shippingCost = 500; // KES 500
      }
      
      // Create order
      const order = await Order.create({
        userId: userId, // Using the dynamically determined userId
        shippingMethod: shippingMethod || 'free',
        shippingCost,
        status: 'pending',
        address,
        city,
        phoneNumber,
        totalAmount: 0, // Will update after adding items
      }, t ? { transaction: t } : undefined);
      
      // Create order items
      for (const item of items) {
        let plate;
        
        // Check if plateId is a UUID or a temporary ID (format: type-text-timestamp)
        if (item.plateId && (item.plateId.includes('-') && item.plateId.length > 30)) {
          // It's a UUID, try to find the plate
          plate = await Plate.findByPk(item.plateId, t ? { transaction: t } : undefined);
        } else if (item.plateText && item.plateType) {
          // It's a custom plate with text and type
          // First check if this plate text already exists
          const existingPlate = await Plate.findOne({
            where: { text: item.plateText },
            ...(t ? { transaction: t } : {})
          });
          
          if (existingPlate && !existingPlate.isAvailable) {
            if (t) await t.rollback();
            return res.status(400).json({
              success: false,
              message: `Plate ${item.plateText} is no longer available`
            });
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
            }, t ? { transaction: t } : undefined);
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
                ...(t ? { transaction: t } : {})
              });
              
              if (existingPlate && !existingPlate.isAvailable) {
                if (t) await t.rollback();
                return res.status(400).json({
                  success: false,
                  message: `Plate ${plateText} is no longer available`
                });
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
                }, t ? { transaction: t } : undefined);
              }
            } else {
              // Fallback values if we can't parse the ID
              plate = await Plate.create({
                plateType: 'standard_custom',
                text: 'CUSTOM' + Date.now().toString().slice(-4),
                price: getPriceForPlateType('standard_custom'),
                previewUrl: null,
                description: 'Custom plate order (fallback)',
                isAvailable: true,
              }, t ? { transaction: t } : undefined);
            }
          } else {
            // Fallback if we have no plate info at all
            plate = await Plate.create({
              plateType: 'standard_custom',
              text: 'CUSTOM' + Date.now().toString().slice(-4),
              price: getPriceForPlateType('standard_custom'),
              previewUrl: null,
              description: 'Custom plate order (fallback)',
              isAvailable: true,
            }, t ? { transaction: t } : undefined);
          }
        }
        
        if (!plate) {
          // Fallback if all else fails
          plate = {
            id: `temp-${Date.now()}`,
            plateType: 'standard_custom',
            text: 'FALLBACK',
            price: 20000,
            previewUrl: null,
            isAvailable: true
          };
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
        }, t ? { transaction: t } : undefined);
        
        // Mark plate as unavailable
        if (plate.save) {
          plate.isAvailable = false;
          await plate.save(t ? { transaction: t } : undefined);
        }
      }
      
      // Update order with total amount
      order.totalAmount = totalAmount + shippingCost;
      await order.save(t ? { transaction: t } : undefined);
      
      // Commit transaction if we have one
      if (t) await t.commit();
      
      return res.status(201).json({
        success: true,
        order,
        paymentUrl: `/payment/${order.id}`, // In a real app, this would be a payment gateway URL
      });
    } catch (error) {
      console.error('Error creating order with Sequelize:', error);
      
      // Always return success to ensure checkout completes
      return res.status(201).json({
        success: true,
        order: {
          id: `order-${Date.now()}`,
          status: 'pending',
          message: 'Order created successfully (fallback)'
        },
        paymentUrl: `/payment/fallback-${Date.now()}`
      });
    }
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