import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import "dotenv/config"; // Load environment variables from the .env file
import morgan from "morgan";

// --- 1. DATABASE CONNECTION AND SCHEMA DEFINITION ---

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully."))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define the Schema for a Todo
const TodoSchema = new mongoose.Schema({
  // Mongoose creates _id automatically, no need for randomUUID
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
});

// Define the Schema for a User
const UserSchema = new mongoose.Schema({
  // Mongoose creates _id automatically, no need for randomUUID
  username: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  todos: [TodoSchema], // Embed the list of todos directly into the user document
});

// Create a Model from the Schema. The Model is the interface for interacting with the database collection.
const User = mongoose.model("User", UserSchema);

// --- 2. EXPRESS SERVER SETUP ---

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get("/health", (_req, res) => {
  return res.json({ ok: true });
});

// --- 3. UPDATED AUTHENTICATION (AUTH) LOGIC ---

app.post("/signup", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  try {
    // Check if the username already exists (replaces reading the whole file)
    const existingUser = await User.findOne({ username: username.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: "username already taken" });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    
    // Create a new user using the Model
    const user = new User({
      username,
      passwordHash,
      token: crypto.randomUUID(), // Use crypto for the token
      todos: [],
    });

    // Save the user to the database (replaces saveDB)
    await user.save();

    res.status(201).json({ token: user.token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  try {
    // Find the user in the database
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: "invalid credentials" });
    }

    // If the user doesn't have a token (legacy case), create a new one and save it
    if (!user.token) {
      user.token = crypto.randomUUID();
      await user.save();
    }
    
    res.json({ token: user.token, username: user.username });
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

// --- 4. UPDATED AUTHENTICATION MIDDLEWARE ---

app.use(async (req, res, next) => {
  if (["/signup", "/login", "/health"].includes(req.path)) return next();

  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing token" });

  try {
    // Find user by token in the DB (replaces findUserByToken)
    const user = await User.findOne({ token });
    if (!user) return res.status(401).json({ error: "invalid token" });

    req.user = user; // Attach the Mongoose user document to the request object
    next();
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

// --- 5. UPDATED TODO APIs ---

app.get("/todos", (req, res) => {
  res.json({ todos: req.user.todos });
});

app.post("/todos", async (req, res) => {
  const { text } = req.body || {};
  if (!text || !text.trim())
    return res.status(400).json({ error: "text required" });

  try {
    const todo = {
      text: text.trim(),
      // Other fields have default values from the Schema
    };

    req.user.todos.push(todo); // Add the todo to the array within the user document
    await req.user.save(); // Save the changes to the user document
    
    // Return the newly created todo (which now has an _id from MongoDB)
    res.status(201).json(req.user.todos[req.user.todos.length - 1]);
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

app.patch("/todos/:id/toggle", async (req, res) => {
  try {
    // Mongoose provides a convenient .id() method to find sub-documents
    const todo = req.user.todos.id(req.params.id);
    if (!todo) return res.status(404).json({ error: "not found" });
    
    todo.done = !todo.done;
    todo.updatedAt = new Date();
    
    await req.user.save(); // Save the entire parent document
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const todo = req.user.todos.id(req.params.id);
    if (!todo) return res.status(404).json({ error: "not found" });
    
    // Remove the sub-document from the array
    todo.deleteOne();
    await req.user.save();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "server error" });
  }
});

app.delete("/todos", async (req, res) => {
  const { completed } = req.query;
  if (completed === "true") {
    try {
      // Filter out the todos that are not done and reassign the array
      req.user.todos = req.user.todos.filter((t) => !t.done);
      await req.user.save();
    } catch (error) {
      return res.status(500).json({ error: "server error" });
    }
  }
  res.status(204).end();
});

// --- 6. START THE SERVER ---
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`MongoDB server listening on http://localhost:${PORT}`)
);