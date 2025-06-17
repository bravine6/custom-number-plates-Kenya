// Mock data for the API when Supabase connection is not available
const plates = [
  {
    id: 1,
    name: 'Standard Plate',
    description: 'Regular Kenyan number plate',
    base_price: 5000.00,
    type: 'standard',
    features: { colors: ['white', 'black'], materials: ['aluminum'] },
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Personalized Plate',
    description: 'Custom text on your plate',
    base_price: 15000.00,
    type: 'personalized',
    features: { colors: ['white', 'black', 'blue'], materials: ['aluminum', 'carbon-fiber'] },
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Vintage Plate',
    description: 'Classic design for vintage vehicles',
    base_price: 8000.00,
    type: 'vintage',
    features: { colors: ['cream', 'black'], materials: ['aluminum'] },
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Digital Plate',
    description: 'Modern digital display plate',
    base_price: 25000.00,
    type: 'digital',
    features: { colors: ['multi'], materials: ['digital-display'] },
    image_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const users = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@plates.com',
    password: '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOSsJTWR3K4Pw2xx1l8HXgnLwD.Ne', // admin123
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Test User',
    email: 'user@example.com',
    password: '$2a$10$7JB720yubVSZvUI0rEqK/.VqGOSsJTWR3K4Pw2xx1l8HXgnLwD.Ne', // admin123
    role: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const orders = [];
const orderItems = [];

// Mock database operations
const db = {
  // Plates
  plates: {
    findAll: (options = {}) => {
      let result = [...plates];
      
      // Filter by type if provided
      if (options.type) {
        result = result.filter(plate => plate.type === options.type);
      }
      
      // Sort by created_at in descending order
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      return Promise.resolve(result);
    },
    findOne: (id) => {
      const plate = plates.find(p => p.id === parseInt(id));
      return Promise.resolve(plate || null);
    },
    create: (data) => {
      const newId = plates.length > 0 ? Math.max(...plates.map(p => p.id)) + 1 : 1;
      const newPlate = {
        id: newId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      plates.push(newPlate);
      return Promise.resolve(newPlate);
    },
    update: (id, data) => {
      const index = plates.findIndex(p => p.id === parseInt(id));
      if (index === -1) return Promise.resolve(null);
      
      plates[index] = {
        ...plates[index],
        ...data,
        updated_at: new Date().toISOString()
      };
      
      return Promise.resolve(plates[index]);
    },
    delete: (id) => {
      const index = plates.findIndex(p => p.id === parseInt(id));
      if (index === -1) return Promise.resolve(false);
      
      plates.splice(index, 1);
      return Promise.resolve(true);
    }
  },
  
  // Users
  users: {
    findByEmail: (email) => {
      const user = users.find(u => u.email === email);
      return Promise.resolve(user || null);
    },
    findById: (id) => {
      const user = users.find(u => u.id === parseInt(id));
      return Promise.resolve(user || null);
    },
    create: (data) => {
      const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      users.push(newUser);
      return Promise.resolve(newUser);
    }
  },
  
  // Custom plates availability check
  plates_availability: {
    checkAvailability: (text) => {
      // Check if text is already used in orderItems
      const exists = orderItems.some(item => 
        item.customization && 
        item.customization.text && 
        item.customization.text.toUpperCase() === text.toUpperCase()
      );
      
      return Promise.resolve(!exists);
    }
  }
};

module.exports = db;