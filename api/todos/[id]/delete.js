import { User, dbConnect } from '../../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
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
    
    // Find and remove todo using JavaScript filter instead of Mongoose deleteOne()
    const todoExists = user.todos.some(todo => todo._id.toString() === id);
    if (!todoExists) {
      return res.status(404).json({ error: 'todo not found' });
    }

    // Filter out the todo to delete it
    user.todos = user.todos.filter(todo => todo._id.toString() !== id);
    await user.save();
    
    return res.status(204).end();
  } catch (error) {
    console.error('Delete todo error:', error);
    return res.status(500).json({ error: 'server error' });
  }
}
// import { User } from '../../_db.js';

// export default async function handler(req, res) {
//   if (req.method !== 'DELETE') {
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
    
//     // Find and remove todo by _id
//     const todo = user.todos.id(id);
//     if (!todo) {
//       return res.status(404).json({ error: 'todo not found' });
//     }

//     // Remove the todo from embedded array
//     todo.deleteOne();
//     await user.save();
    
//     return res.status(204).end();
//   } catch (error) {
//     console.error('Delete todo error:', error);
//     return res.status(500).json({ error: 'server error' });
//   }
// }