import mongoose from 'mongoose';

// Connect to MongoDB (only connect once)
if (!mongoose.connection.readyState) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Todo Schema
const TodoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  todos: [TodoSchema], // Embedded todos
});

// Create Models
const User = mongoose.model('User', UserSchema);

export { User };