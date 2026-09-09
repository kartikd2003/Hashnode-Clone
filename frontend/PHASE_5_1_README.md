# Hashnode Phase 5.1 — Public Platform Overlay

This ZIP is designed to be extracted over the existing Hashnode `frontend` folder.

It adds:
- reusable LoadingSpinner
- reusable ErrorMessage
- reusable TagPill
- reusable PostList
- Footer
- TagPage at `/tag/:slug`
- PublicProfile at `/profile/:id`
- canonical post route `/post/:slug`
- public-platform CSS

It preserves the existing authentication/editor pages and existing frontend structure.

## Important backend dependency

Public profile requires:
GET /api/users/:id

The existing Phase 4 backend does not currently expose this endpoint, so `/profile/:id`
will remain unavailable until the Phase 5 backend profile endpoint is implemented.

## Extraction

Extract the contents of this ZIP into:

E:\KARTIK\PROJECTS\Hashnode\frontend

Allow Windows to replace existing files when prompted.

Then run:

npm run build

If the build succeeds:

npm run dev
