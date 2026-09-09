# Hashnode Clone

Full-stack blogging platform built with MERN.

## Login Credentials

id: kartik@test.com
id: aman@test.com
password: password123

## Features

- User registration
- User login
- JWT authentication
- Create posts
- Save drafts
- Publish posts
- Edit posts
- Delete posts
- Publish/unpublish
- Search posts
- Pagination
- Markdown rendering
- Author ownership
- Protected APIs

## Tech Stack

Frontend:
- React
- React Router
- Axios
- Vite

Backend:
- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- bcryptjs

Infrastructure:
- Docker
- MongoDB Docker container

## Project Structure

Hashnode/
├── backend/
├── frontend/
├── docker-compose.yml
├── .gitignore
└── README.md

## Running the Project

### 1. Start MongoDB

docker compose up -d

### 2. Backend

cd backend
npm install
npm run dev

### 3. Frontend

cd frontend
npm install
npm run dev