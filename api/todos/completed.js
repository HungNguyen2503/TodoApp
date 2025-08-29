import dbConnect from '../_db.js';
import { withAuth } from '../_utils/auth.js';
import { sendError } from '../_utils/response.js';

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return sendError(res, 405, 'Method not allowed.');
  }
  
  await dbConnect();

  req.user.todos = req.user.todos.filter(t => !t.done);
  
  try {
    await req.user.save();
    return res.status(204).end();
  } catch (error) {
    console.error('Clear completed todos error:', error);
    return sendError(res, 500, 'Failed to clear completed todos.');
  }
}

export default withAuth(handler);