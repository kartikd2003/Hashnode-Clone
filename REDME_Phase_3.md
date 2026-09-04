# Hashnode — Phase 3 Code Package

This package implements the Phase 3 Posts/Blog system planned for the Hashnode project.

Included:
- Post MongoDB model
- Post CRUD API
- Author ownership checks
- Slug generation
- Draft/published workflow
- Public feed
- Single post view
- My Posts dashboard
- Create/Edit Post UI
- Delete confirmation
- Publish/Unpublish
- Search and pagination
- Markdown rendering with code highlighting
- React Router routes
- API service for posts

IMPORTANT:
1. Copy the backend files into your existing `backend/src` folders.
2. Copy the frontend files into your existing `frontend/src` folders.
3. Do NOT replace your existing `.env`, User model, authController, AuthContext, or authMiddleware unless necessary.
4. Your existing authentication must expose `req.user.userId`.
5. Install the frontend dependencies listed below.

Backend:
- No new npm dependency is required if Phase 2 already has Express, Mongoose and JWT.
- Start with: `npm run dev`

Frontend:
Run:
npm install react-markdown remark-gfm react-syntax-highlighter

Then:
npm run dev

Recommended Phase 3 verification:
1. Login.
2. Open `/posts/new`.
3. Create a draft.
4. Open `/my-posts`.
5. Publish it.
6. Open `/`.
7. Open the post.
8. Edit it.
9. Delete it.
10. Verify another user cannot edit/delete it.
