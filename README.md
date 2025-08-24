# TodoApp

A simple and modern Todo application built with React and Node.js.

## Features

- User authentication (signup & login)
- Add, edit, delete, and toggle todos
- RESTful API for todo management
- Responsive and clean UI
- Sample data and schema included

## Project Structure

```
TodoApp/
  api/              # Backend API routes and logic
    app.js
    login.js
    signup.js
    todos.js
    health.js
    _db.js
    todos/[id]/toggle.js
  db.json           # Database file for todos and users
  sample-todo.json  # Example todo data
  todo-schema.json  # JSON schema for todos
  server.js         # Express server entry point
  src/              # Frontend React source code
    App.jsx
    main.jsx
    components/
      TodoInput.jsx
      TodoList.jsx
    app.css
  index.html        # Main HTML file
  package.json      # Project dependencies
  README.md         # Project documentation
  .gitignore        # Git ignore file
  vite.config.js    # Vite configuration
  vercel.json       # Vercel deployment config
```

## Getting Started

### 1. Clone the repository

```sh
git clone <repo-link>
cd TodoApp
```

### 2. Install dependencies

```sh
npm install
```

### 3. Start the backend server

```sh
node server.js
```
The backend will run at [http://localhost:5000](http://localhost:5000) by default.

### 4. Start the frontend development server

```sh
npm run dev
```
The frontend will run at [http://localhost:5173](http://localhost:5173) by default.

## API Endpoints

- `POST /api/signup` — Register a new user
- `POST /api/login` — Login and get a token
- `GET /api/todos` — Get all todos
- `POST /api/todos` — Add a new todo
- `PUT /api/todos/:id` — Edit a todo
- `DELETE /api/todos/:id` — Delete a todo
- `POST /api/todos/:id/toggle` — Toggle todo completion

## Configuration

- Edit `db.json` for initial data.
- Edit `todo-schema.json` for todo validation schema.
- Update API endpoints in frontend if backend URL changes.

## Deployment

- Ready for deployment on Vercel (see `vercel.json`).

## Contribution

Feel free to open issues or submit pull requests for improvements or bug fixes.

---