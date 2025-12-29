import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('item', 'title imageUrl')
      .populate('borrower', 'name profilePhoto')
      .populate('lender', 'name profilePhoto')
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get user transactions
// @route   GET /api/transactions/user/:userId
// @access  Private
export const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { borrower: req.params.userId },
        { lender: req.params.userId }
      ]
    })
      .populate('item', 'title imageUrl')
      .populate('borrower', 'name profilePhoto')
      .populate('lender', 'name profilePhoto')
      .sort({ createdAt: -1 });
    
    res.json(transactions);
  } catch (error) {
    console.error('Get user transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
export const createTransaction = async (req, res) => {
  try {
    const { item, lender, pickupTime } = req.body;
    
    // Validation
    if (!item || !lender) {
      return res.status(400).json({ message: 'Item and lender are required' });
    }
    
    const transaction = new Transaction({
      item,
      borrower: req.user.id,
      lender,
      pickupTime: pickupTime || new Date(),
      status: 'requested'
    });
    
    const savedTransaction = await transaction.save();
    
    // Populate details
    await savedTransaction.populate([
      { path: 'item', select: 'title imageUrl' },
      { path: 'borrower', select: 'name profilePhoto' },
      { path: 'lender', select: 'name profilePhoto' }
    ]);
    
    res.status(201).json({
      success: true,
      transaction: savedTransaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(400).json({ message: 'Failed to create transaction', error: error.message });
  }
};

// @desc    Update transaction
// @route   PATCH /api/transactions/:id
// @access  Private
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check if user is part of the transaction
    const userId = req.user.id;
    if (
      transaction.borrower.toString() !== userId &&
      transaction.lender.toString() !== userId
    ) {
      return res.status(403).json({ message: 'Not authorized to update this transaction' });
    }
    
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'item', select: 'title imageUrl' },
      { path: 'borrower', select: 'name profilePhoto' },
      { path: 'lender', select: 'name profilePhoto' }
    ]);
    
    // If transaction is completed, update eco points
    if (req.body.status === 'completed') {
      // Award points to borrower
      await User.findByIdAndUpdate(transaction.borrower, {
        $inc: { ecoPoints: 15 }
      });
      
      // Award points to lender
      await User.findByIdAndUpdate(transaction.lender, {
        $inc: { ecoPoints: 25 }
      });
    }
    
    res.json({
      success: true,
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(400).json({ message: 'Failed to update transaction', error: error.message });
  }
};

// @desc    Rate transaction
// @route   PATCH /api/transactions/:id/rate
// @access  Private
export const rateTransaction = async (req, res) => {
  try {
    const { rating, review, ratingFor } = req.body; // ratingFor: 'lender' or 'borrower'
    
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    const userId = req.user.id;
    
    // Update rating based on who is rating
    if (ratingFor === 'lender' && transaction.borrower.toString() === userId) {
      transaction.ratingLender = rating;
      transaction.reviewLender = review;
    } else if (ratingFor === 'borrower' && transaction.lender.toString() === userId) {
      transaction.ratingBorrower = rating;
      transaction.reviewBorrower = review;
    } else {
      return res.status(403).json({ message: 'Not authorized to rate this transaction' });
    }
    
    await transaction.save();
    
    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    console.error('Rate transaction error:', error);
    res.status(400).json({ message: 'Failed to rate transaction', error: error.message });
  }
};
