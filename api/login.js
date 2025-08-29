import { User } from './_db.js';
import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method not allowed' });
  }
  
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    // Check password
    if (!bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

    // Generate token if doesn't exist (legacy support)
    if (!user.token) {
      user.token = randomUUID();
      await user.save();
    }
    
    return res.json({ 
      token: user.token, 
      username: user.username 
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'server error' });
  }
}