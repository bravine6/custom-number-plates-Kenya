const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Check which database mode we're using
const useSupabaseRest = process.env.USE_SUPABASE_REST === 'true';
const useMockDb = process.env.USE_MOCK_DB === 'true';

// Import appropriate database adapter
const { sequelize, supabaseClient } = require('../config/db');

// Create model depending on database mode
let User;

if (useSupabaseRest) {
  // Create a model class for Supabase that has the same interface as Sequelize
  class SupabaseUserModel {
    constructor(data) {
      Object.assign(this, data);
    }
    
    // Static methods
    static async findOne(options) {
      if (options && options.where && options.where.email) {
        const { data, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('email', options.where.email)
          .single();
          
        if (error || !data) return null;
        return new SupabaseUserModel(data);
      }
      return null;
    }
    
    static async findByPk(id, options) {
      const { data, error } = await supabaseClient
        .from('users')
        .select(options && options.attributes ? options.attributes.join(',') : '*')
        .eq('id', id)
        .single();
        
      if (error || !data) return null;
      return new SupabaseUserModel(data);
    }
    
    static async create(userData) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      const { data, error } = await supabaseClient
        .from('users')
        .insert([userData])
        .select()
        .single();
        
      if (error) throw error;
      return new SupabaseUserModel(data);
    }
    
    // Instance methods
    async matchPassword(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    }
    
    getSignedJwtToken() {
      return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
      });
    }
    
    async save() {
      const { data, error } = await supabaseClient
        .from('users')
        .update(this)
        .eq('id', this.id)
        .select()
        .single();
        
      if (error) throw error;
      Object.assign(this, data);
      return this;
    }
  }
  
  // Use the Supabase model
  User = SupabaseUserModel;
} else {
  // Traditional Sequelize model
  User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 100],
      },
    },
    idNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true,
    tableName: 'users',  // Explicitly set table name to lowercase
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  // Match user entered password to hashed password in database
  User.prototype.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };

  // Sign JWT and return
  User.prototype.getSignedJwtToken = function() {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });
  };
}

module.exports = User;