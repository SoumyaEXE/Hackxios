import Item from '../models/Item.js';

// @desc    Get all items
// @route   GET /api/items
// @access  Public
export const getAllItems = async (req, res) => {
  try {
    const items = await Item.find({ status: 'available' })
      .populate('owner', 'name profilePhoto trustScore')
      .sort({ createdAt: -1 });
    
    res.json(items);
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get items near a location
// @route   GET /api/items/nearby
// @access  Public
export const getNearbyItems = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000, category } = req.query;
    
    if (!lng || !lat) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }
    
    const query = {
      status: 'available',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    };
    
    if (category) query.category = category;
    
    const items = await Item.find(query)
      .populate('owner', 'name profilePhoto trustScore');
    
    res.json(items);
  } catch (error) {
    console.error('Get nearby items error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single item by ID
// @route   GET /api/items/:id
// @access  Public
export const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('owner', 'name profilePhoto trustScore ecoPoints level');
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Get item by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new item
// @route   POST /api/items
// @access  Private
export const createItem = async (req, res) => {
  try {
    const { title, description, category, type, price, coordinates, imageUrl } = req.body;
    
    // Validation
    if (!title || !description || !category || !type || !coordinates) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    const item = new Item({
      owner: req.user.id,
      title,
      description,
      category,
      type,
      price: price || 0,
      imageUrl,
      location: {
        type: 'Point',
        coordinates: [coordinates[1], coordinates[0]] // [lng, lat]
      }
    });
    
    const savedItem = await item.save();
    
    // Populate owner details
    await savedItem.populate('owner', 'name profilePhoto trustScore');
    
    res.status(201).json({
      success: true,
      item: savedItem
    });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(400).json({ message: 'Failed to create item', error: error.message });
  }
};

// @desc    Update item
// @route   PATCH /api/items/:id
// @access  Private
export const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if user owns the item
    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }
    
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'name profilePhoto trustScore');
    
    res.json({
      success: true,
      item: updatedItem
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(400).json({ message: 'Failed to update item', error: error.message });
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
export const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if user owns the item
    if (item.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }
    
    await Item.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Failed to delete item', error: error.message });
  }
};
