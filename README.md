# TodoApp

Simple Todo application (frontend + serverless API) with persistent storage on MongoDB Atlas.

## Features
- Create / read / toggle / delete todos
- Simple auth (signup/login) — token-based (demo)
- Serverless API under `api/` (compatible with Vercel)
- Local dev server and optional Node `server.js` for local API
- Uses MongoDB Atlas for persistent storage

## Prerequisites
- Node.js 16+ and npm
- MongoDB Atlas account (or any MongoDB URI)

## Quick start (local)
1. Clone repository and open project folder
2. Install dependencies
```bash
npm install
```

3. Create `.env` in project root with MongoDB connection string:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/todo_db?retryWrites=true&w=majority
```

4. Run development server
- If you use Vite frontend + serverless `api/` locally (recommended for Vercel-like behavior), run:
```bash
npm run dev
```
- If you prefer a local Node server (uses `server.js`), run:
```bash
node server.js
```

Open frontend at the address shown by Vite (default `http://localhost:5173`) or `http://localhost:3000` depending on config.

## API (serverless / local)
The project exposes these endpoints (under `/api` or when using local server under `/api`):

- `POST /api/signup`  
  Body: `{ "username": "...", "password": "..." }`  
  Response: `{ token, username }` (demo token is user id)

- `POST /api/login`  
  Body: `{ "username": "...", "password": "..." }`  
  Response: `{ token, username }`

- `GET /api/todos`  
  Headers: `Authorization: Bearer <token>`  
  Response: `{ todos: [...] }`

- `POST /api/todos`  
  Headers: `Authorization: Bearer <token>`  
  Body: `{ "text": "todo text" }`  
  Response: created todo object

- `POST /api/todos/:id/toggle`  
  Headers: `Authorization: Bearer <token>`  
  Toggle a todo's done/completed state.

Adjust requests if you run the backend under a different base path or port.

## Frontend usage
- Main UI files: `src/App.jsx`, `src/components/TodoInput.jsx`, `src/components/TodoList.jsx`
- The frontend calls the serverless API at `/api/*`. If you deploy frontend separately, change API base URL in the frontend code to point to your backend.

## Deploy to Vercel
- Vercel auto-detects the `api/` folder as serverless functions.
1. Push repo to Git provider (GitHub/GitLab).
2. Create a new project on Vercel and link the repo.
3. Add environment variable in Vercel dashboard:
   - `MONGODB_URI` = your Atlas connection string
4. Deploy. Vercel will run build and expose frontend + API.

Note: serverless functions are ephemeral — use Atlas (or another hosted DB) for persistent storage.

## Security & notes
- This project uses a simple token scheme for demo. For production, use JWT with proper secret and password hashing (bcrypt).
- Do NOT commit `.env` or credentials to version control. `.gitignore` should exclude `.env`.
- If using MongoDB Atlas, whitelist your IP or allow access from anywhere (0.0.0.0/0) for quick testing (less secure).

## Troubleshooting
- `Cannot find module 'mongodb'` — run `npm install mongodb` (or `mongoose` if code uses mongoose).
- Connection issues — verify `MONGODB_URI`, network access and Atlas user/password.
- If API returns 401, ensure you send `Authorization: Bearer <token>` header after login/signup.

## Development tips
- Use Postman or curl to test API endpoints.
- To seed initial data, insert documents into your Atlas collection or extend `api/health.js` to seed for dev.