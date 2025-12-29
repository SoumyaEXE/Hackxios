import express from 'express';
import {
  getAllRequests,
  getNearbyRequests,
  createRequest,
  updateRequestStatus,
  deleteRequest
} from '../controllers/requestController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllRequests);
router.get('/nearby', getNearbyRequests);
router.post('/', protect, createRequest);
router.patch('/:id', protect, updateRequestStatus);
router.delete('/:id', protect, deleteRequest);

export default router;
