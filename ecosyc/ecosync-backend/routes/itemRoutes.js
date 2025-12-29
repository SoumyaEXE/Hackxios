import express from 'express';
import {
  getAllItems,
  getNearbyItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
} from '../controllers/itemController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllItems);
router.get('/nearby', getNearbyItems);
router.get('/:id', getItemById);
router.post('/', protect, createItem);
router.patch('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

export default router;
