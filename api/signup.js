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
    // Check if username already exists
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'username already taken' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    
    // Create new user
    const user = new User({
      username,
      passwordHash,
      token: randomUUID(),
      todos: [],
    });

    await user.save();
    
    return res.status(201).json({ 
      token: user.token, 
      username: user.username 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'server error' });
  }
}