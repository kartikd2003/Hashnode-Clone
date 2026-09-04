# Phase 3 API smoke tests

Assume the backend is running on port 5000.

## Public feed

curl.exe "http://localhost:5000/api/posts"

## Public search

curl.exe "http://localhost:5000/api/posts?search=javascript"

## Authenticated create

Replace TOKEN with your JWT:

curl.exe -X POST "http://localhost:5000/api/posts" -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" --data-binary "@post-test.json"

Example `post-test.json`:

{
  "title": "My First Hashnode Post",
  "content": "# Hello\n\nThis is my **first post**.\n\n```js\nconsole.log('Hello Hashnode');\n```",
  "excerpt": "My first Hashnode post.",
  "coverImage": "",
  "tags": ["javascript", "mongodb"],
  "status": "draft"
}

## My posts

curl.exe "http://localhost:5000/api/posts/mine" -H "Authorization: Bearer TOKEN"

## Publish

curl.exe -X POST "http://localhost:5000/api/posts/POST_ID/publish" -H "Authorization: Bearer TOKEN"

## Unpublish

curl.exe -X POST "http://localhost:5000/api/posts/POST_ID/unpublish" -H "Authorization: Bearer TOKEN"

## Update

curl.exe -X PUT "http://localhost:5000/api/posts/POST_ID" -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" --data-binary "@post-update.json"

## Delete

curl.exe -X DELETE "http://localhost:5000/api/posts/POST_ID" -H "Authorization: Bearer TOKEN"
