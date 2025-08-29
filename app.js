import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Đảm bảo các biến môi trường được tải
import morgan from "morgan";

// Import các handlers từ thư mục api
import healthHandler from './api/health.js';
import signupHandler from './api/auth/signup.js';
import loginHandler from './api/auth/login.js';
import todosHandler from './api/todos/index.js';
import todoByIdHandler from './api/todos/[id].js';
import completedTodosHandler from './api/todos/completed.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors()); // Cho phép cross-origin requests
app.use(express.json()); // Phân tích body của request dưới dạng JSON
app.use(morgan('dev'));
// --- Định tuyến (Routing) ---
console.log('Registering API routes...');

// Route cơ bản
app.get('/api/health', healthHandler);

// Routes cho xác thực
app.post('/api/auth/signup', signupHandler);
app.post('/api/auth/login', loginHandler);

// Routes cho Todos
app.get('/api/todos', todosHandler);
app.post('/api/todos', todosHandler);
app.delete('/api/todos/completed', completedTodosHandler);

// Route cho một todo cụ thể (với tham số động)
// Express sử dụng cú pháp :id thay cho [id]
app.patch('/api/todos/:id/toggle', todoByIdHandler);
app.delete('/api/todos/:id', todoByIdHandler);

// Xử lý route không tồn tại
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`🚀 Local API server is running on http://localhost:${PORT}`);
});