const asyncHandler = require('express-async-handler');
const { Plate, OrderItem } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all plates
// @route   GET /api/v1/plates
// @access  Public
const getPlates = asyncHandler(async (req, res) => {
  const { type } = req.query;
  
  const whereConditions = {};
  
  if (type) {
    whereConditions.plateType = type;
  }
  
  const plates = await Plate.findAll({
    where: whereConditions,
    order: [['createdAt', 'DESC']],
  });
  
  res.json(plates);
});

// @desc    Get plate by ID
// @route   GET /api/v1/plates/:id
// @access  Public
const getPlateById = asyncHandler(async (req, res) => {
  const plate = await Plate.findByPk(req.params.id);
  
  if (plate) {
    res.json(plate);
  } else {
    res.status(404);
    throw new Error('Plate not found');
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
  const { plateType, text, price, description } = req.body;
  
  if (!plateType || !text) {
    res.status(400);
    throw new Error('Please provide plate type and text');
  }
  
  // Generate preview URL
  const previewUrl = `/previews/${plateType}/${text}.png`;
  
  const plate = await Plate.create({
    plateType,
    text,
    price,
    previewUrl,
    description,
  });
  
  res.status(201).json(plate);
});

// @desc    Update plate (admin only)
// @route   PUT /api/v1/plates/:id
// @access  Private/Admin
const updatePlate = asyncHandler(async (req, res) => {
  const { plateType, text, price, description, isAvailable } = req.body;
  
  const plate = await Plate.findByPk(req.params.id);
  
  if (!plate) {
    res.status(404);
    throw new Error('Plate not found');
  }
  
  plate.plateType = plateType || plate.plateType;
  plate.text = text || plate.text;
  plate.price = price || plate.price;
  plate.description = description || plate.description;
  plate.isAvailable = isAvailable !== undefined ? isAvailable : plate.isAvailable;
  
  // Update preview URL if text or type changed
  if (text || plateType) {
    plate.previewUrl = `/previews/${plateType || plate.plateType}/${text || plate.text}.png`;
  }
  
  await plate.save();
  
  res.json(plate);
});

// @desc    Delete plate (admin only)
// @route   DELETE /api/v1/plates/:id
// @access  Private/Admin
const deletePlate = asyncHandler(async (req, res) => {
  const plate = await Plate.findByPk(req.params.id);
  
  if (!plate) {
    res.status(404);
    throw new Error('Plate not found');
  }
  
  await plate.destroy();
  
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
  
  // First check in the Plates table
  const existingPlate = await Plate.findOne({
    where: { 
      text: text.toUpperCase(),
      isAvailable: false
    }
  });
  
  // Then check in OrderItems (as backup check)
  const existingOrderItem = await OrderItem.findOne({
    where: { 
      plateText: text.toUpperCase() 
    }
  });
  
  const isAvailable = !existingPlate && !existingOrderItem;
  
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