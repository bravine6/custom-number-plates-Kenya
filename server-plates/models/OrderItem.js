const { DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Check which database mode we're using
const useSupabaseRest = process.env.USE_SUPABASE_REST === 'true';

// Import appropriate database adapter
const { sequelize, supabaseClient } = require('../config/db');

// Create model depending on database mode
let OrderItem;

if (useSupabaseRest) {
  // Create a model class for Supabase that has the same interface as Sequelize
  class SupabaseOrderItemModel {
    constructor(data) {
      Object.assign(this, data);
    }
    
    // Static methods
    static async findAll(options = {}) {
      let query = supabaseClient.from('orderitems').select('*');
      
      // Apply filters if provided
      if (options.where) {
        if (options.where.orderId) {
          query = query.eq('orderId', options.where.orderId);
        }
        if (options.where.id) {
          query = query.eq('id', options.where.id);
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
      return data ? data.map(item => new SupabaseOrderItemModel(item)) : [];
    }
    
    static async findByPk(id) {
      const { data, error } = await supabaseClient
        .from('orderitems')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error || !data) return null;
      return new SupabaseOrderItemModel(data);
    }
    
    static async create(itemData) {
      const { data, error } = await supabaseClient
        .from('orderitems')
        .insert([itemData])
        .select()
        .single();
        
      if (error) throw error;
      return new SupabaseOrderItemModel(data);
    }
    
    // Instance methods
    async update(updateData) {
      const { data, error } = await supabaseClient
        .from('orderitems')
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
  OrderItem = SupabaseOrderItemModel;
} else {
  // Traditional Sequelize model
  OrderItem = sequelize.define('OrderItem', {
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
}

module.exports = OrderItem;