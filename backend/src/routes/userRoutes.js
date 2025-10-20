import express from 'express';
import {getAllUsers, getUserById, updateProfile, removeConnection,connectUser, getConnections,updateUserValidation} from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.get('/', authMiddleware, getAllUsers); // Get all users with optional filters
router.get('/:id', authMiddleware, getUserById);
router.put('/me', authMiddleware,updateUserValidation, updateProfile);
router.post('/me/connect/:id', authMiddleware, connectUser);
router.delete('/me/connect/:id', authMiddleware, removeConnection);
router.get('/me/connections', authMiddleware, getConnections);

export default router;

