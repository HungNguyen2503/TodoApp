import { User, dbConnect } from './_db.js';

async function authenticate(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    res.status(401).json({ error: 'missing token' });
    return null;
  }
  
  try {
    const user = await User.findOne({ token });
    if (!user) {
      res.status(401).json({ error: 'invalid token' });
      return null;
    }
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'server error' });
    return null;
  }
}

export default async function handler(req, res) {
  try {
    // Connect to database
    await dbConnect();
    
    const user = await authenticate(req, res);
    if (!user) return; // Response already sent

    if (req.method === 'GET') {
      return res.json({ todos: user.todos });
    }

    if (req.method === 'POST') {
      const { text } = req.body || {};
      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'text required' });
      }
      
      const todo = {
        text: text.trim(),
        done: false,
        createdAt: new Date(),
      };
      
      user.todos.push(todo);
      await user.save();
      
      // Return the newly created todo with _id
      const newTodo = user.todos[user.todos.length - 1];
      return res.status(201).json(newTodo);
    }

    if (req.method === 'DELETE') {
      const { completed } = req.query || {};
      if (completed === 'true') {
        user.todos = user.todos.filter(t => !t.done);
        await user.save();
      }
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'method not allowed' });
  } catch (error) {
    console.error('Todos API error:', error);
    return res.status(500).json({ error: 'server error' });
  }
}
// import { User } from './_db.js';

// async function authenticate(req, res) {
//   const authHeader = req.headers.authorization || '';
//   const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
//   if (!token) {
//     res.status(401).json({ error: 'missing token' });
//     return null;
//   }
  
//   try {
//     const user = await User.findOne({ token });
//     if (!user) {
//       res.status(401).json({ error: 'invalid token' });
//       return null;
//     }
//     return user;
//   } catch (error) {
//     res.status(500).json({ error: 'server error' });
//     return null;
//   }
// }

// export default async function handler(req, res) {
//   try {
//     const user = await authenticate(req, res);
//     if (!user) return; // Response already sent

//     if (req.method === 'GET') {
//       return res.json({ todos: user.todos });
//     }

//     if (req.method === 'POST') {
//       const { text } = req.body || {};
//       if (!text || !text.trim()) {
//         return res.status(400).json({ error: 'text required' });
//       }
      
//       const todo = {
//         text: text.trim(),
//         done: false,
//         createdAt: new Date(),
//       };
      
//       user.todos.push(todo);
//       await user.save();
      
//       // Return the newly created todo with _id
//       const newTodo = user.todos[user.todos.length - 1];
//       return res.status(201).json(newTodo);
//     }

//     if (req.method === 'DELETE') {
//       const { completed } = req.query || {};
//       if (completed === 'true') {
//         user.todos = user.todos.filter(t => !t.done);
//         await user.save();
//       }
//       return res.status(204).end();
//     }

//     return res.status(405).json({ error: 'method not allowed' });
//   } catch (error) {
//     console.error('Todos API error:', error);
//     return res.status(500).json({ error: 'server error' });
//   }
// }