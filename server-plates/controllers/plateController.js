const asyncHandler = require('express-async-handler');

// Import mock database for fallback
const mockDb = require('../data/mockData');

// Import Supabase client with error handling
let supabase;
try {
  const supabaseModule = require('../supabase');
  supabase = supabaseModule.supabase;
} catch (error) {
  console.error('Error loading Supabase client in plateController:', error.message);
  console.log('Using mock database instead');
}

// @desc    Get all plates
// @route   GET /api/v1/plates
// @access  Public
const getPlates = asyncHandler(async (req, res) => {
  // Use the supabase instance from the request if available, otherwise use the global one
  const supabaseClient = req.supabase || supabase;
  
  // Check if we should use mock database
  if ((process.env.USE_MOCK_DB === 'true' && req.mockDb) || !supabaseClient) {
    // Use mock database instead
    console.log('Using mock database for getPlates');
    const { type } = req.query;
    const options = type ? { type } : {};
    const plates = await mockDb.plates.findAll(options);
    return res.json(plates);
  }
  
  try {
    const { type } = req.query;
    
    let query = supabaseClient.from('plates').select('*');
    
    if (type) {
      query = query.eq('type', type);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      // Fallback to mock database if Supabase query fails
      const options = type ? { type } : {};
      const plates = await mockDb.plates.findAll(options);
      return res.json(plates);
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error in getPlates:', error);
    // Fallback to mock database if any error occurs
    const { type } = req.query;
    const options = type ? { type } : {};
    const plates = await mockDb.plates.findAll(options);
    return res.json(plates);
  }
});

// @desc    Get plate by ID
// @route   GET /api/v1/plates/:id
// @access  Public
const getPlateById = asyncHandler(async (req, res) => {
  // Check if Supabase client is available
  if (!supabase) {
    // Use mock database instead
    const plate = await mockDb.plates.findOne(req.params.id);
    
    if (!plate) {
      res.status(404);
      throw new Error('Plate not found');
    }
    
    return res.json(plate);
  }
  
  try {
    const { data, error } = await supabase
      .from('plates')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) {
      console.error('Supabase query error:', error);
      // Fallback to mock database if Supabase query fails
      const plate = await mockDb.plates.findOne(req.params.id);
      
      if (!plate) {
        res.status(404);
        throw new Error('Plate not found');
      }
      
      return res.json(plate);
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error in getPlateById:', error);
    // Fallback to mock database if any error occurs
    const plate = await mockDb.plates.findOne(req.params.id);
    
    if (!plate) {
      res.status(404);
      throw new Error('Plate not found');
    }
    
    return res.json(plate);
  }
});

// @desc    Generate plate preview
// @route   POST /api/v1/plates/preview
// @access  Public
const generatePlatePreview = asyncHandler(async (req, res) => {
  const { text, plateType } = req.body;
  
  if (!text || !plateType) {
    res.status(400);
    throw new Error('Please provide both text and plate type');
  }
  
  // In a real implementation, this would generate an actual preview image
  // For this demo, we'll just return a placeholder URL
  const previewUrl = `/previews/${plateType}/${text}.png`;
  
  res.json({
    success: true,
    previewUrl,
    plateType,
    text,
  });
});

// @desc    Create new plate (admin only)
// @route   POST /api/v1/plates
// @access  Private/Admin
const createPlate = asyncHandler(async (req, res) => {
  const { type, name, base_price, description, features, image_url } = req.body;
  
  if (!type || !name || !base_price) {
    res.status(400);
    throw new Error('Please provide plate type, name and base price');
  }
  
  const { data, error } = await supabase
    .from('plates')
    .insert([
      { 
        type,
        name,
        description,
        base_price,
        features: features || {},
        image_url: image_url || null
      }
    ])
    .select()
    .single();
  
  if (error) {
    res.status(500);
    throw new Error(error.message);
  }
  
  res.status(201).json(data);
});

// @desc    Update plate (admin only)
// @route   PUT /api/v1/plates/:id
// @access  Private/Admin
const updatePlate = asyncHandler(async (req, res) => {
  const { type, name, base_price, description, features, image_url } = req.body;
  
  // First check if plate exists
  const { data: plate, error: fetchError } = await supabase
    .from('plates')
    .select('*')
    .eq('id', req.params.id)
    .single();
  
  if (fetchError) {
    res.status(404);
    throw new Error('Plate not found');
  }
  
  // Update the plate
  const { data, error } = await supabase
    .from('plates')
    .update({ 
      type: type || plate.type,
      name: name || plate.name,
      description: description || plate.description,
      base_price: base_price || plate.base_price,
      features: features || plate.features,
      image_url: image_url || plate.image_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', req.params.id)
    .select()
    .single();
  
  if (error) {
    res.status(500);
    throw new Error(error.message);
  }
  
  res.json(data);
});

// @desc    Delete plate (admin only)
// @route   DELETE /api/v1/plates/:id
// @access  Private/Admin
const deletePlate = asyncHandler(async (req, res) => {
  // First check if plate exists
  const { data: plate, error: fetchError } = await supabase
    .from('plates')
    .select('*')
    .eq('id', req.params.id)
    .single();
  
  if (fetchError) {
    res.status(404);
    throw new Error('Plate not found');
  }
  
  // Delete the plate
  const { error } = await supabase
    .from('plates')
    .delete()
    .eq('id', req.params.id);
  
  if (error) {
    res.status(500);
    throw new Error(error.message);
  }
  
  res.json({ message: 'Plate removed' });
});

// @desc    Check if plate text is available
// @route   GET /api/v1/plates/check-availability/:text
// @access  Public
const checkPlateAvailability = asyncHandler(async (req, res) => {
  const { text } = req.params;
  
  if (!text) {
    res.status(400);
    throw new Error('Please provide plate text to check');
  }
  
  try {
    // Use the supabase instance from the request if available, otherwise use the global one
    const supabaseClient = req.supabase || supabase;
    
    // Check if we should use mock database
    if ((process.env.USE_MOCK_DB === 'true' && req.mockDb) || !supabaseClient) {
      console.log('Using mock database for plate availability check');
      
      // Check availability in mock database
      const isAvailable = await req.mockDb.plates_availability.checkAvailability(text);
      
      return res.json({
        text: text.toUpperCase(),
        isAvailable,
        message: isAvailable 
          ? 'This plate text is available!' 
          : 'This plate text is already taken. Please choose another.',
      });
    }
    
    // Using Supabase (the preferred option)
    if (supabaseClient) {
      console.log('Using Supabase for plate availability check');
      
      // First check in plates table
      const { data: existingPlate, error: plateError } = await supabaseClient
        .from('plates')
        .select('id')
        .ilike('text', text.toUpperCase())
        .limit(1);
      
      if (plateError) {
        console.error('Error checking plates table:', plateError);
        // Continue to check orderitems even if there's an error with plates table
      } else if (existingPlate && existingPlate.length > 0) {
        // Plate text already exists in plates table
        return res.json({
          text: text.toUpperCase(),
          isAvailable: false,
          message: 'This plate text is already taken. Please choose another.'
        });
      }
      
      // Next check in orderitems table
      const { data: existingOrderItem, error: orderItemError } = await supabaseClient
        .from('orderitems')
        .select('id')
        .ilike('plateText', text.toUpperCase())
        .limit(1);
      
      if (orderItemError) {
        console.error('Error checking orderitems table:', orderItemError);
        // Fall back to assuming it's available if there's an error
        return res.json({
          text: text.toUpperCase(),
          isAvailable: true,
          message: 'This plate text is available!'
        });
      }
      
      const isAvailable = !existingOrderItem || existingOrderItem.length === 0;
      
      return res.json({
        text: text.toUpperCase(),
        isAvailable,
        message: isAvailable 
          ? 'This plate text is available!' 
          : 'This plate text is already taken. Please choose another.',
      });
    }
    
    // Fallback to assuming it's available if no database connection
    return res.json({
      text: text.toUpperCase(),
      isAvailable: true,
      message: 'This plate text is available! (Using fallback)',
    });
  } catch (error) {
    console.error('Error checking plate availability:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking availability. Please try again.',
      error: process.env.NODE_ENV === 'production' ? null : error.message
    });
  }
});

module.exports = {
  getPlates,
  getPlateById,
  generatePlatePreview,
  createPlate,
  updatePlate,
  deletePlate,
  checkPlateAvailability,
};