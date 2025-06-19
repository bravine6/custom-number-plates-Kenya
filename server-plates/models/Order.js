const { DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Check which database mode we're using
const useSupabaseRest = process.env.USE_SUPABASE_REST === 'true';

// Import appropriate database adapter
const { sequelize, supabaseClient } = require('../config/db');

// Create model depending on database mode
let Order;

if (useSupabaseRest) {
  // Create a model class for Supabase that has the same interface as Sequelize
  class SupabaseOrderModel {
    constructor(data) {
      Object.assign(this, data);
    }
    
    // Static methods
    static async findAll(options = {}) {
      let query = supabaseClient.from('orders').select('*');
      
      // Apply filters if provided
      if (options.where) {
        if (options.where.userId) {
          query = query.eq('userId', options.where.userId);
        }
        if (options.where.id) {
          query = query.eq('id', options.where.id);
        }
        if (options.where.status) {
          query = query.eq('status', options.where.status);
        }
      }
      
      // Apply order if provided
      if (options.order) {
        const [field, direction] = options.order[0];
        query = query.order(field, { ascending: direction === 'ASC' });
      } else {
        // Default sorting
        query = query.order('created_at', { ascending: false });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data ? data.map(item => new SupabaseOrderModel(item)) : [];
    }
    
    static async findByPk(id, options = {}) {
      let fields = '*';
      
      // Handle include option for Sequelize compatibility
      if (options.include) {
        // If we need to include related models, we need to use a different approach
        // Here we would use Supabase's nested queries, but for simplicity, we'll just
        // fetch the order and then fetch the related items separately
      }
      
      const { data, error } = await supabaseClient
        .from('orders')
        .select(fields)
        .eq('id', id)
        .single();
        
      if (error || !data) return null;
      
      const order = new SupabaseOrderModel(data);
      
      // If we need to include items, fetch them
      if (options.include && options.include.some(include => include.model && include.model.name === 'OrderItem')) {
        const { data: items, error: itemsError } = await supabaseClient
          .from('order_items')
          .select('*')
          .eq('orderId', id);
          
        if (!itemsError && items) {
          order.OrderItems = items;
        }
      }
      
      return order;
    }
    
    static async create(orderData) {
      // Calculate shipping cost based on method (replicating beforeValidate hook)
      if (orderData.shippingMethod === 'express') {
        orderData.shippingCost = 500; // KES 500 for express shipping
      } else {
        orderData.shippingCost = 0; // Free for standard shipping or pickup
      }
      
      const { data, error } = await supabaseClient
        .from('orders')
        .insert([orderData])
        .select()
        .single();
        
      if (error) throw error;
      return new SupabaseOrderModel(data);
    }
    
    // Instance methods
    async update(updateData) {
      const { data, error } = await supabaseClient
        .from('orders')
        .update(updateData)
        .eq('id', this.id)
        .select()
        .single();
        
      if (error) throw error;
      Object.assign(this, data);
      return this;
    }
  }
  
  // Use the Supabase model
  Order = SupabaseOrderModel;
} else {
  // Traditional Sequelize model
  Order = sequelize.define('Order', {
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
}

module.exports = Order;