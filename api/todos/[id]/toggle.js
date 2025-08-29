import { User, dbConnect } from '../../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ error: 'missing token' });
  }

  try {
    // Connect to database
    await dbConnect();
    
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ error: 'invalid token' });
    }

    const { id } = req.query;
    
    // Find todo using JavaScript instead of Mongoose .id() method
    const todoIndex = user.todos.findIndex(todo => todo._id.toString() === id);
    if (todoIndex === -1) {
      return res.status(404).json({ error: 'not found' });
    }

    // Toggle done status
    user.todos[todoIndex].done = !user.todos[todoIndex].done;
    user.todos[todoIndex].updatedAt = new Date();
    
    await user.save();
    
    return res.json(user.todos[todoIndex]);
  } catch (error) {
    console.error('Toggle todo error:', error);
    return res.status(500).json({ error: 'server error' });
  }
}
// import { User } from '../../_db.js';

// export default async function handler(req, res) {
//   if (req.method !== 'PATCH') {
//     return res.status(405).json({ error: 'method not allowed' });
//   }

//   const authHeader = req.headers.authorization || '';
//   const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
//   if (!token) {
//     return res.status(401).json({ error: 'missing token' });
//   }

//   try {
//     const user = await User.findOne({ token });
//     if (!user) {
//       return res.status(401).json({ error: 'invalid token' });
//     }

//     const { id } = req.query;
    
//     // Find todo by _id in embedded array
//     const todo = user.todos.id(id);
//     if (!todo) {
//       return res.status(404).json({ error: 'not found' });
//     }

//     // Toggle done status
//     todo.done = !todo.done;
//     todo.updatedAt = new Date();
    
//     await user.save();
    
//     return res.json(todo);
//   } catch (error) {
//     console.error('Toggle todo error:', error);
//     return res.status(500).json({ error: 'server error' });
//   }
// }