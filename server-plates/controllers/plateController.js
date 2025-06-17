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
  // Check if Supabase client is available
  if (!supabase) {
    // Use mock database instead
    const { type } = req.query;
    const options = type ? { type } : {};
    const plates = await mockDb.plates.findAll(options);
    return res.json(plates);
  }
  
  try {
    const { type } = req.query;
    
    let query = supabase.from('plates').select('*');
    
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
  
  // First check in custom plates
  const { data: existingCustomPlate, error: customError } = await supabase
    .from('order_items')
    .select('id')
    .ilike('customization->>text', text.toUpperCase())
    .limit(1);
  
  if (customError) {
    res.status(500);
    throw new Error(customError.message);
  }
  
  const isAvailable = !existingCustomPlate || existingCustomPlate.length === 0;
  
  res.json({
    text: text.toUpperCase(),
    isAvailable,
    message: isAvailable 
      ? 'This plate text is available!' 
      : 'This plate text is already taken. Please choose another.',
  });
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