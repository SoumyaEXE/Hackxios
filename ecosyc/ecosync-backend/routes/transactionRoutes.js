import express from 'express';
import {
  getAllTransactions,
  getUserTransactions,
  createTransaction,
  updateTransaction,
  rateTransaction
} from '../controllers/transactionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAllTransactions);
router.get('/user/:userId', protect, getUserTransactions);
router.post('/', protect, createTransaction);
router.patch('/:id', protect, updateTransaction);
router.patch('/:id/rate', protect, rateTransaction);

export default router;
