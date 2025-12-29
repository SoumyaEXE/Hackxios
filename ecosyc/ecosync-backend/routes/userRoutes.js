import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateUserPoints,
  getLeaderboard
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/leaderboard', getLeaderboard);
router.get('/:id', getUserProfile);
router.patch('/:id', protect, updateUserProfile);
router.patch('/:id/points', protect, updateUserPoints);

export default router;
