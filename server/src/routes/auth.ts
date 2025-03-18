import express from 'express';
import { login, logout, getCurrentUser } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { body } from 'express-validator';

const router = express.Router();

// Login endpoint
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

// Logout endpoint
router.post('/logout', logout);

// Get current user endpoint (protected)
router.get('/me', authenticate, getCurrentUser);

export { router as authRouter }; 
