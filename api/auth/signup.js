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
      return sendError(res, 400, 'Username and password are required.');
    }
    if (password.length < 6) {
        return sendError(res, 400, 'Password must be at least 6 characters long.');
    }

    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return sendError(res, 409, 'Username already taken.');
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    const user = new User({
      username,
      passwordHash,
      todos: [],
    });
    const token = createToken(user._id);
    await user.save();
    
    return sendJSON(res, 201, { token, username: user.username });
  } catch (error) {
    // console.error('Signup error:', error);
    return sendError(res, 500, 'Server error during signup.');
  }
}