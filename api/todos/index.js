import dbConnect from '../_db.js';
import { withAuth } from '../_utils/auth.js';
import { sendJSON, sendError } from '../_utils/response.js';

async function handler(req, res) {
  await dbConnect();
  
  switch (req.method) {
    case 'GET':
      return getTodos(req, res);
    case 'POST':
      return addTodo(req, res);
    default:
      return sendError(res, 405, 'Method not allowed.');
  }
}

async function getTodos(req, res) {
  return sendJSON(res, 200, { todos: req.user.todos });
}

async function addTodo(req, res) {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return sendError(res, 400, 'Todo text is required.');
  }

  const todo = { text: text.trim() };
  req.user.todos.push(todo);
  
  try {
    await req.user.save();
    const newTodo = req.user.todos[req.user.todos.length - 1];
    return sendJSON(res, 201, newTodo);
  } catch (error) {
    console.error('Add todo error:', error);
    return sendError(res, 500, 'Failed to add todo.');
  }
}

export default withAuth(handler);