import dbConnect from '../_db.js';
import { withAuth } from '../_utils/auth.js';
import { sendJSON, sendError } from '../_utils/response.js';

async function handler(req, res) {
  await dbConnect();
  
  const { id } = req.query;
  const todo = req.user.todos.id(id);

  if (!todo) {
    return sendError(res, 404, 'Todo not found.');
  }
  
  switch (req.method) {
    case 'PATCH':
      return toggleTodo(req, res, todo);
    case 'DELETE':
      return deleteTodo(req, res, todo);
    default:
      return sendError(res, 405, 'Method not allowed.');
  }
}

async function toggleTodo(req, res, todo) {
  todo.done = !todo.done;
  todo.updatedAt = new Date();

  try {
    await req.user.save();
    return sendJSON(res, 200, todo);
  } catch (error) {
    console.error('Toggle todo error:', error);
    return sendError(res, 500, 'Failed to toggle todo.');
  }
}

async function deleteTodo(req, res, todo) {
    try {
      todo.deleteOne();
      await req.user.save();
      return res.status(204).end();
    } catch (error) {
      console.error('Delete todo error:', error);
      return sendError(res, 500, 'Failed to delete todo.');
    }
}

export default withAuth(handler);