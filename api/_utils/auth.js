import jwt from 'jsonwebtoken';
import { User } from '../_db.js';
import { sendError } from './response.js';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Please define the JWT_SECRET environment variable inside .env');
}

// Hàm tạo token
export function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// Middleware xác thực
export const withAuth = (handler) => async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return sendError(res, 401, 'Authentication required: Missing token.');
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      return sendError(res, 401, 'Authentication failed: User not found.');
    }

    req.user = user;
    return handler(req, res);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return sendError(res, 401, 'Invalid or expired token.');
    }
    console.error('Authentication error:', error);
    return sendError(res, 500, 'Internal server error during authentication.');
  }
};