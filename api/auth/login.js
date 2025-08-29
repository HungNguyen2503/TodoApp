import bcrypt from 'bcryptjs';
import dbConnect, { User } from '../_db.js';
import { createToken } from '../_utils/auth.js';
import { sendJSON, sendError } from '../_utils/response.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendError(res, 405, 'Method not allowed.');
  }

  try {
    await dbConnect();
    
    const { username, password } = req.body;
    if (!username || !password) {
      return sendError(res, 400, 'Username and password required.');
    }

    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return sendError(res, 401, 'Invalid credentials.');
    }
    
    const token = createToken(user._id);
    
    return sendJSON(res, 200, { token, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Server error during login.');
  }
}