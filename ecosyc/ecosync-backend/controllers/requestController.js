import Request from '../models/Request.js';

// @desc    Get all active requests
// @route   GET /api/requests
// @access  Public
export const getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find({ status: 'active' })
      .populate('user', 'name profilePhoto')
      .sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get requests near a location
// @route   GET /api/requests/nearby
// @access  Public
export const getNearbyRequests = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 5000 } = req.query;
    
    if (!lng || !lat) {
      return res.status(400).json({ message: 'Longitude and latitude are required' });
    }
    
    const requests = await Request.find({
      status: 'active',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).populate('user', 'name profilePhoto');
    
    res.json(requests);
  } catch (error) {
    console.error('Get nearby requests error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new request
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res) => {
  try {
    const { itemName, description, urgency, coordinates } = req.body;
    
    // Validation
    if (!itemName || !coordinates) {
      return res.status(400).json({ message: 'Item name and coordinates are required' });
    }
    
    const request = new Request({
      user: req.user.id,
      itemName,
      description,
      urgency: urgency || 'normal',
      location: {
        type: 'Point',
        coordinates: [coordinates[1], coordinates[0]] // [lng, lat]
      }
    });
    
    const savedRequest = await request.save();
    
    // Populate user details
    await savedRequest.populate('user', 'name profilePhoto');
    
    res.status(201).json({
      success: true,
      request: savedRequest
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(400).json({ message: 'Failed to create request', error: error.message });
  }
};

// @desc    Update request status
// @route   PATCH /api/requests/:id
// @access  Private
export const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if user owns the request
    if (request.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }
    
    request.status = status;
    await request.save();
    
    res.json({
      success: true,
      request
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(400).json({ message: 'Failed to update request', error: error.message });
  }
};

// @desc    Delete a request
// @route   DELETE /api/requests/:id
// @access  Private
export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if user owns the request
    if (request.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }
    
    await Request.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ message: 'Failed to delete request', error: error.message });
  }
};
