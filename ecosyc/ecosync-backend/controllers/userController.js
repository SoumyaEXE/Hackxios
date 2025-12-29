import User from '../models/User.js';

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update user profile
// @route   PATCH /api/users/:id
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }
    
    const { name, profilePhoto, location } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (profilePhoto) updateData.profilePhoto = profilePhoto;
    if (location) updateData.location = location;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(400).json({ message: 'Failed to update profile', error: error.message });
  }
};

// @desc    Update user eco points
// @route   PATCH /api/users/:id/points
// @access  Private
export const updateUserPoints = async (req, res) => {
  try {
    const { points } = req.body;
    
    if (typeof points !== 'number') {
      return res.status(400).json({ message: 'Points must be a number' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.ecoPoints += points;
    
    // Update level based on points
    if (user.ecoPoints >= 301) {
      user.level = 'champion';
    } else if (user.ecoPoints >= 151) {
      user.level = 'oak';
    } else if (user.ecoPoints >= 51) {
      user.level = 'sapling';
    } else {
      user.level = 'seedling';
    }
    
    await user.save();
    
    res.json({
      success: true,
      user: {
        id: user._id,
        ecoPoints: user.ecoPoints,
        level: user.level
      }
    });
  } catch (error) {
    console.error('Update user points error:', error);
    res.status(400).json({ message: 'Failed to update points', error: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/users/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const users = await User.find()
      .select('name profilePhoto ecoPoints level trustScore')
      .sort({ ecoPoints: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      leaderboard: users
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
