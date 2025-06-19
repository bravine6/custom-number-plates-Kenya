const { DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// Check which database mode we're using
const useSupabaseRest = process.env.USE_SUPABASE_REST === 'true';

// Import appropriate database adapter
const { sequelize, supabaseClient } = require('../config/db');

// Create model depending on database mode
let Plate;

if (useSupabaseRest) {
  // Create a model class for Supabase that has the same interface as Sequelize
  class SupabasePlateModel {
    constructor(data) {
      Object.assign(this, data);
    }
    
    // Static methods
    static async findAll(options = {}) {
      let query = supabaseClient.from('plates').select('*');
      
      // Apply filters if provided
      if (options.where) {
        if (options.where.plateType) {
          query = query.eq('plateType', options.where.plateType);
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
      return data ? data.map(item => new SupabasePlateModel(item)) : [];
    }
    
    static async findByPk(id) {
      const { data, error } = await supabaseClient
        .from('plates')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error || !data) return null;
      return new SupabasePlateModel(data);
    }
    
    static async create(plateData) {
      // Set default prices based on plate type
      if (!plateData.price) {
        switch (plateData.plateType) {
          case 'special':
            plateData.price = 20000; // KES 20,000
            break;
          case 'standard_custom':
            plateData.price = 40000; // KES 40,000
            break;
          case 'prestige':
            plateData.price = 80000; // KES 80,000
            break;
          default:
            plateData.price = 0;
        }
      }
      
      const { data, error } = await supabaseClient
        .from('plates')
        .insert([plateData])
        .select()
        .single();
        
      if (error) throw error;
      return new SupabasePlateModel(data);
    }
  }
  
  // Use the Supabase model
  Plate = SupabasePlateModel;
} else {
  // Traditional Sequelize model
  Plate = sequelize.define('Plate', {
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
}

module.exports = Plate;