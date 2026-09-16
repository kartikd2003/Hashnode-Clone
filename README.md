# Hashnode

A full-stack, developer-first blogging and publishing platform built on the **MERN** stack (MongoDB, Express, React, Node.js). Write in Markdown, share code with syntax highlighting, organize posts by tags, and browse a public feed of articles from other developers.

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white">
</p>

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Start MongoDB](#2-start-mongodb)
  - [3. Configure and run the backend](#3-configure-and-run-the-backend)
  - [4. Configure and run the frontend](#4-configure-and-run-the-frontend)
  - [5. Open the app](#5-open-the-app)
- [Environment variables](#environment-variables)
- [Demo accounts](#demo-accounts)
- [API reference](#api-reference)
- [NPM scripts](#npm-scripts)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

- 🔐 **Authentication** — register/login with JWT, passwords hashed with bcrypt, sessions persisted across refreshes
- ✍️ **Markdown editor** — live preview, fenced code blocks with language-based syntax highlighting (via `react-syntax-highlighter`)
- 📝 **Full post CRUD** — save drafts, publish/unpublish, edit, delete — with server-side ownership checks (you can never edit someone else's post, even by calling the API directly)
- 🏷️ **Tags** — attach tags while writing, browse a tag directory, filter the feed by tag
- 🌍 **Public developer feed** — searchable, paginated, newest-first; drafts are never publicly visible
- 👤 **Public profiles** — every author has a profile page listing their published posts
- ❤️ **Engagement** — likes, bookmarks, threaded-per-post comments, and notifications for likes/comments on your posts
- 📊 **Personal dashboard** — manage all your drafts and published posts in one place

## Tech stack

| Layer      | Technology                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| Frontend   | React 19, React Router 7, Vite 8, Axios, `react-markdown` + `remark-gfm`, `react-syntax-highlighter` |
| Backend    | Node.js, Express 5, Mongoose 9                                              |
| Database   | MongoDB 7 (via Docker)                                                      |
| Auth       | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` password hashing              |
| Dev tools  | Nodemon (backend hot-reload), ESLint (frontend linting)                     |

## Architecture

Hashnode follows a standard **decoupled MERN architecture**. The React client is a single-page app that never talks to MongoDB directly — every read/write goes through the Express REST API, which is the single source of truth for validation, authorization, and data access via Mongoose.

```
┌──────────────────────┬─────────────────────────┬─────────────────────┐
│ React Client         │ Express REST API        │ MongoDB             │
│ (Vite, :5173)        │ (Node.js, :5000)        │ (Docker, :27017)    │
├──────────────────────┼─────────────────────────┼─────────────────────┤
│ React Router pages   │ Routes                  │ users               │
│ AuthContext (global) │ -> Controllers          │ posts               │
│ Axios instance       │ -> Middleware           │ tags                │
│                      │ -> Models               │ comments / likes    │
│                      │                         │ bookmarks / etc.    │
└──────────────────────┴─────────────────────────┴─────────────────────┘

  React Client  ──HTTPS/JSON (Axios, JWT header)──▶  Express API
  Express API   ──Mongoose ODM────────────────────▶  MongoDB
```

**Auth flow:** Client sends credentials to `POST /api/auth/login` → server verifies the bcrypt hash → signs a JWT → client stores the token and attaches it as `Authorization: Bearer <token>` on every subsequent protected request → `authMiddleware` verifies the token before the request reaches a controller.

**Backend layering** (`backend/src`):

```
routes/        →  defines endpoints, wires middleware
  ↓
middleware/    →  authMiddleware (JWT verification), errorMiddleware (centralized error handling)
  ↓
controllers/   →  request/response handling, validation, business logic
  ↓
models/        →  Mongoose schemas (User, Post, Tag, Comment, Like, Bookmark, Notification, PostView)
  ↓
utils/         →  shared helpers (slugify, response serializers)
```

**Frontend layering** (`frontend/src`):

```
main.jsx           → mounts <App/> inside BrowserRouter + AuthProvider
App.jsx             → renders AppRoutes
routes/             → route table + ProtectedRoute guard for authenticated-only pages
layouts/            → MainLayout (header/nav/footer shell wrapping every page)
pages/              → one component per route (Feed, PostDetail, Dashboard, PostEditor, ...)
components/         → reusable UI (PostCard, TagPill, LoadingSpinner, ErrorMessage, ...)
context/            → AuthContext — global auth state (user, token, loading) via React Context API
services/           → typed wrappers around Axios calls (postService, engagementService)
utils/api.js        → pre-configured Axios instance (base URL + auto-attached JWT header)
```

**Data model relationships:**

- One **User** authors many **Posts** (`Post.author` → `User`).
- **Post.tags** is stored as an array of plain tag-name strings (not references) — the separate **Tag** collection exists to power the tag directory (post counts, discovery) and is kept in sync whenever a post is saved.
- **Comment**, **Like**, and **Bookmark** each reference a `Post` and a `User`.
- **Notification** is created when another user likes or comments on your post.
- **PostView** records one view per unique visitor (hashed IP + user-agent) per post, used to increment `Post.views`.

## Project structure

```
Hashnode/
├── backend/
│   ├── src/
│   │   ├── app.js              # Express app: middleware + route mounting
│   │   ├── server.js           # entry point: connects DB, starts the HTTP server
│   │   ├── config/              # env loading, MongoDB connection
│   │   ├── controllers/         # auth, post, tag, user, engagement
│   │   ├── middleware/          # authMiddleware, errorMiddleware
│   │   ├── models/               # User, Post, Tag, Comment, Like, Bookmark, Notification, PostView
│   │   ├── routes/               # one router file per resource
│   │   └── utils/                # slugify, response serializers
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/               # one component per route
│   │   ├── components/          # reusable UI pieces
│   │   ├── layouts/              # MainLayout (header/nav/footer)
│   │   ├── routes/               # AppRoutes, ProtectedRoute
│   │   ├── context/               # AuthContext
│   │   ├── services/              # Axios API wrappers
│   │   ├── utils/api.js           # Axios instance
│   │   └── index.css              # single global stylesheet / design system
│   ├── .env.example
│   └── package.json
├── docker-compose.yml            # MongoDB container for local development
└── README.md
```

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or later, and npm
- [Docker](https://www.docker.com/) (for running MongoDB locally) — or a MongoDB connection string of your own (e.g. [MongoDB Atlas](https://www.mongodb.com/atlas))
- Git

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/hashnode.git
cd hashnode
```

### 2. Start MongoDB

This spins up a MongoDB 7 container named `mongodb`, exposed on the default port `27017`, with its data persisted in a Docker volume:

```bash
docker compose up -d
```

Already have MongoDB running elsewhere (Atlas, a local install, etc.)? Skip this step and just point `MONGODB_URI` (below) at your own connection string.

### 3. Configure and run the backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

The API starts on **http://localhost:5000** (health check: `GET /api/health`). `npm run dev` uses `nodemon` for hot-reload; use `npm start` to run it without hot-reload.

### 4. Configure and run the frontend

Open a **new terminal** for this step (keep the backend running):

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The app starts on **http://localhost:5173**.

### 5. Open the app

Visit **http://localhost:5173**, register a new account, and start writing. See [Demo accounts](#demo-accounts) below if you'd rather log in with pre-seeded credentials.

## Environment variables

**`backend/.env`** (copy from `backend/.env.example`):

| Variable       | Description                                              | Example                                    |
| -------------- | ---------------------------------------------------------- | ------------------------------------------- |
| `PORT`         | Port the Express server listens on                          | `5000`                                      |
| `MONGODB_URI`  | MongoDB connection string                                    | `mongodb://127.0.0.1:27017/hashnode`        |
| `CLIENT_URL`   | Frontend origin, used for CORS                                | `http://localhost:5173`                     |
| `JWT_SECRET`   | Secret used to sign JWTs — **use a long, random value**       | *(generate your own — see below)*           |

Generate a secure `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**`frontend/.env`** (copy from `frontend/.env.example`):

| Variable         | Description                     | Example                        |
| ---------------- | -------------------------------- | -------------------------------- |
| `VITE_API_URL`   | Base URL the frontend calls        | `http://localhost:5000/api`     |

> ⚠️ Never commit real `.env` files — only `.env.example` templates belong in version control. `.gitignore` already excludes `.env` for both apps.

## Demo accounts

If you've seeded the database with sample data, these accounts are available for a quick login:

| Email                 | Password      |
| ---------------------- | -------------- |
| `kartik@test.com`      | `password123`  |
| `aman@test.com`        | `password123`  |

Otherwise, just register a new account from the app — it takes a few seconds.

## API reference

All endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint                              | Auth | Description                                   |
| ------ | -------------------------------------- | :--: | ----------------------------------------------- |
| GET    | `/health`                              |      | API health check                                |
| POST   | `/auth/register`                       |      | Create an account                               |
| POST   | `/auth/login`                          |      | Log in, receive a JWT                           |
| GET    | `/auth/me`                             |  ✅  | Get the current authenticated user              |
| PUT    | `/auth/change-password`                |  ✅  | Change your password (requires current password) |
| GET    | `/posts`                               |      | Public feed — supports `?page`, `?limit`, `?search`, `?tag` |
| GET    | `/posts/:slug`                         |      | Get a single published post                     |
| GET    | `/posts/mine`                          |  ✅  | List the current user's posts (drafts + published) |
| GET    | `/posts/:id/edit`                      |  ✅  | Get one of your own posts for editing           |
| POST   | `/posts`                               |  ✅  | Create a post (draft or published)              |
| PUT    | `/posts/:id`                           |  ✅  | Update a post you own                           |
| DELETE | `/posts/:id`                           |  ✅  | Delete a post you own                           |
| POST   | `/posts/:id/publish`                   |  ✅  | Publish a draft                                 |
| POST   | `/posts/:id/unpublish`                 |  ✅  | Move a published post back to draft             |
| GET    | `/tags`                                |      | List all tags with post counts                  |
| GET    | `/tags/:slug/posts`                    |      | Published posts under a tag                     |
| POST   | `/tags`                                |  ✅  | Create or reuse a tag                           |
| GET    | `/users/:id`                           |      | Public profile + that user's published posts    |
| PUT    | `/users/me`                            |  ✅  | Update your own name / bio / avatar             |
| POST   | `/engagement/posts/:postId/view`       |      | Record a view                                   |
| GET    | `/engagement/posts/:postId/comments`   |      | List comments on a post                         |
| GET    | `/engagement/posts/:postId/like`       |  ✅  | Check your like status + count                  |
| POST   | `/engagement/posts/:postId/like`       |  ✅  | Like a post                                     |
| DELETE | `/engagement/posts/:postId/like`       |  ✅  | Unlike a post                                   |
| POST   | `/engagement/posts/:postId/comments`   |  ✅  | Add a comment                                   |
| PUT    | `/engagement/comments/:commentId`      |  ✅  | Edit your own comment                           |
| DELETE | `/engagement/comments/:commentId`      |  ✅  | Delete your own comment                         |
| GET    | `/engagement/posts/:postId/bookmark`   |  ✅  | Check your bookmark status                      |
| POST   | `/engagement/posts/:postId/bookmark`   |  ✅  | Bookmark a post                                 |
| DELETE | `/engagement/posts/:postId/bookmark`   |  ✅  | Remove a bookmark                               |
| GET    | `/engagement/bookmarks`                |  ✅  | List your bookmarks                             |
| GET    | `/engagement/notifications`            |  ✅  | List your notifications                         |
| PATCH  | `/engagement/notifications/:id/read`   |  ✅  | Mark one notification as read                   |
| PATCH  | `/engagement/notifications/read-all`   |  ✅  | Mark all notifications as read                  |

## NPM scripts

**Backend** (`backend/package.json`):

| Script        | Description                             |
| -------------- | ------------------------------------------ |
| `npm run dev`  | Start the API with hot-reload (nodemon)   |
| `npm start`    | Start the API (production mode)           |

**Frontend** (`frontend/package.json`):

| Script            | Description                        |
| ------------------ | ------------------------------------- |
| `npm run dev`       | Start the Vite dev server            |
| `npm run build`     | Build a production bundle to `dist/` |
| `npm run preview`   | Preview the production build locally |
| `npm run lint`      | Run ESLint                            |

## Troubleshooting

- **Frontend can't reach the API / network errors in the browser console** — confirm the backend is running on the port in `VITE_API_URL` (`frontend/.env`), and that `CLIENT_URL` in `backend/.env` matches the URL the frontend is actually served from (CORS will otherwise reject the request).
- **`ECONNREFUSED` connecting to MongoDB** — make sure the container is running: `docker ps` should show a `mongodb` container. Start it with `docker compose up -d`, and check `docker compose logs mongodb` if it isn't healthy.
- **Port already in use** — change `PORT` in `backend/.env`, or stop whatever else is using `5000` / `5173` / `27017`.

## License

This project is provided as-is for educational purposes.
