# Saturn API Documentation

This document provides comprehensive documentation for the Saturn API endpoints. The Saturn server is a federated social media platform that implements ActivityPub standards for federation.

## Table of Contents

- [Authentication](#authentication)
- [Actors API](#actors-api)
- [Auth API](#auth-api)
- [Posts API](#posts-api)
- [Media API](#media-api)
- [WebFinger API](#webfinger-api)
- [ActivityPub API](#activitypub-api)

## Authentication

Many endpoints require authentication. These endpoints expect a JWT token to be provided in the Authorization header using the Bearer scheme.

**Example:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

If authentication fails, the server will respond with a `401 Unauthorized` status code and a JSON error object:

```json
{
  "status": "error",
  "type": "UNAUTHORIZED",
  "message": "Invalid token"
}
```

## Actors API

Endpoints for managing user actors in the system.

### GET /api/actors/search

Search for actors by query string.

**Authentication:** Not required

**Query Parameters:**
- `q` (string, required): The search query string

**Request Headers:**
- `Content-Type: application/json`

**Success Response:**
- Status Code: 200 OK
- Response Body: Array of actor objects
```json
[
  {
    "_id": "123456789",
    "preferredUsername": "alice",
    "name": "Alice Smith",
    "bio": "Hello, I'm Alice!",
    "icon": {
      "url": "https://example.com/avatars/alice-123456.jpg",
      "mediaType": "image/jpeg"
    }
  }
]
```

**Error Responses:**
- Status Code: 500 Internal Server Error
```json
{
  "status": "error",
  "type": "SERVER_ERROR",
  "message": "Failed to search actors"
}
```

### POST /api/actors

Create a new actor.

**Authentication:** Not required

**Request Headers:**
- `Content-Type: multipart/form-data`

**Request Body (multipart/form-data):**
- `username` (string, required): The username for the new actor (alphanumeric and underscores only)
- `displayName` (string, optional): The display name for the actor
- `bio` (string, optional): The actor's bio/description
- `password` (string, required): The password for authentication
- `avatarFile` (file, optional): Avatar image file

**Success Response:**
- Status Code: 201 Created
- Response Body: Created actor object
```json
{
  "_id": "123456789",
  "preferredUsername": "alice",
  "name": "Alice Smith",
  "bio": "Hello, I'm Alice!",
  "icon": {
    "url": "https://example.com/avatars/alice-123456.jpg",
    "mediaType": "image/jpeg"
  },
  "summary": "Hello, I'm Alice!"
}
```

**Error Responses:**
- Status Code: 400 Bad Request
```json
{
  "error": "Username is required"
}
```
- Status Code: 400 Bad Request
```json
{
  "error": "Password is required"
}
```
- Status Code: 400 Bad Request
```json
{
  "error": "Username can only contain letters, numbers, and underscores"
}
```
- Status Code: 409 Conflict
```json
{
  "error": "Username already exists"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to create actor"
}
```

### GET /api/actors/:username

Get an actor by username.

**Authentication:** Not required

**Path Parameters:**
- `username` (string, required): The username of the actor to retrieve

**Request Headers:**
- `Content-Type: application/json`

**Success Response:**
- Status Code: 200 OK
- Response Body: Actor object
```json
{
  "_id": "123456789",
  "preferredUsername": "alice",
  "name": "Alice Smith",
  "bio": "Hello, I'm Alice!",
  "icon": {
    "url": "https://example.com/avatars/alice-123456.jpg",
    "mediaType": "image/jpeg"
  },
  "summary": "Hello, I'm Alice!"
}
```

**Error Responses:**
- Status Code: 404 Not Found
```json
{
  "error": "Actor not found"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to fetch actor"
}
```

### PUT /api/actors/:username

Update an actor.

**Authentication:** Required

**Path Parameters:**
- `username` (string, required): The username of the actor to update

**Request Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
- `displayName` (string, optional): The updated display name
- `bio` (string, optional): The updated bio/description
- `avatarFile` (file, optional): New avatar image file

**Success Response:**
- Status Code: 200 OK
- Response Body: Updated actor object
```json
{
  "_id": "123456789",
  "preferredUsername": "alice",
  "name": "Alice Smith Updated",
  "bio": "Updated bio!",
  "icon": {
    "url": "https://example.com/avatars/alice-654321.jpg",
    "mediaType": "image/jpeg"
  }
}
```

**Error Responses:**
- Status Code: 401 Unauthorized
```json
{
  "error": "Authorization header required"
}
```
- Status Code: 404 Not Found
```json
{
  "error": "Actor not found"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to update actor"
}
```

### DELETE /api/actors/:username

Delete an actor.

**Authentication:** Required

**Path Parameters:**
- `username` (string, required): The username of the actor to delete

**Request Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Success Response:**
- Status Code: 204 No Content
- Response Body: None

**Error Responses:**
- Status Code: 401 Unauthorized
```json
{
  "error": "Authorization header required"
}
```
- Status Code: 403 Forbidden
```json
{
  "error": "You are not authorized to delete this actor"
}
```
- Status Code: 404 Not Found
```json
{
  "error": "Actor not found"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to delete actor"
}
```

## Auth API

Endpoints for user authentication and authorization.

### POST /api/auth/register

Register a new user.

**Authentication:** Not required

**Request Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "username": "alice",
  "password": "securepassword",
  "displayName": "Alice Smith",
  "bio": "Hello, I'm Alice!"
}
```

**Success Response:**
- Status Code: 201 Created
- Response Body:
```json
{
  "actor": {
    "_id": "123456789",
    "preferredUsername": "alice",
    "name": "Alice Smith",
    "bio": "Hello, I'm Alice!"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- Status Code: 400 Bad Request
```json
{
  "error": "Username and password are required"
}
```
- Status Code: 400 Bad Request
```json
{
  "error": "Username can only contain letters, numbers, and underscores"
}
```
- Status Code: 409 Conflict
```json
{
  "error": "Username already exists"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to register user"
}
```

### POST /api/auth/login

Login and obtain an authentication token.

**Authentication:** Not required

**Request Headers:**
- `Content-Type: application/json`

**Request Body:**
```json
{
  "username": "alice",
  "password": "securepassword"
}
```

**Success Response:**
- Status Code: 200 OK
- Response Body:
```json
{
  "actor": {
    "_id": "123456789",
    "preferredUsername": "alice",
    "name": "Alice Smith",
    "bio": "Hello, I'm Alice!"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- Status Code: 400 Bad Request
```json
{
  "error": "Username and password are required"
}
```
- Status Code: 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to login user"
}
```

### GET /api/auth/me

Get the currently authenticated user's profile.

**Authentication:** Required

**Request Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Success Response:**
- Status Code: 200 OK
- Response Body: User object
```json
{
  "_id": "123456789",
  "preferredUsername": "alice",
  "name": "Alice Smith",
  "bio": "Hello, I'm Alice!"
}
```

**Error Responses:**
- Status Code: 401 Unauthorized
```json
{
  "error": "Not authenticated"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to fetch current user"
}
```

## Posts API

Endpoints for managing posts in the social network.

### POST /api/posts

Create a new post.

**Authentication:** Required

**Request Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
- `content` (string, optional if attachments provided): The post content
- `sensitive` (string, optional): Whether the post contains sensitive content, "true" or "false"
- `contentWarning` (string, optional): Content warning for the post
- `attachments` (files, optional if content provided): Media files to attach to the post

**Success Response:**
- Status Code: 201 Created
- Response Body: Created post object
```json
{
  "id": "post123456",
  "content": "Hello, world!",
  "author": {
    "id": "user123456",
    "username": "alice",
    "displayName": "Alice Smith",
    "avatarUrl": "https://example.com/avatars/alice-123456.jpg"
  },
  "attachments": [
    {
      "url": "https://example.com/media/image-123456.jpg",
      "type": "Image",
      "mediaType": "image/jpeg"
    }
  ],
  "createdAt": "2025-04-01T12:30:45.678Z",
  "sensitive": false,
  "contentWarning": "",
  "likes": 0,
  "likedByUser": false,
  "shares": 0
}
```

**Error Responses:**
- Status Code: 400 Bad Request
```json
{
  "error": "Post must contain content or attachments"
}
```
- Status Code: 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to create post"
}
```

### GET /api/posts

Get the public timeline feed of posts.

**Authentication:** Optional (if provided, will indicate whether posts are liked by the user)

**Request Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>` (optional)

**Query Parameters:**
- `page` (number, optional): Page number for pagination, defaults to 1
- `limit` (number, optional): Number of posts per page, defaults to 20

**Success Response:**
- Status Code: 200 OK
- Response Body:
```json
{
  "posts": [
    {
      "id": "post123456",
      "content": "Hello, world!",
      "author": {
        "id": "user123456",
        "username": "alice",
        "displayName": "Alice Smith",
        "avatarUrl": "https://example.com/avatars/alice-123456.jpg"
      },
      "attachments": [
        {
          "url": "https://example.com/media/image-123456.jpg",
          "type": "Image",
          "mediaType": "image/jpeg"
        }
      ],
      "createdAt": "2025-04-01T12:30:45.678Z",
      "sensitive": false,
      "contentWarning": "",
      "likes": 5,
      "likedByUser": true,
      "shares": 2
    }
  ],
  "hasMore": true
}
```

**Error Responses:**
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to get posts"
}
```

### GET /api/posts/:id

Get a single post by ID.

**Authentication:** Optional (if provided, will indicate whether the post is liked by the user)

**Path Parameters:**
- `id` (string, required): The ID of the post to retrieve

**Request Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>` (optional)

**Success Response:**
- Status Code: 200 OK
- Response Body: Post object
```json
{
  "id": "post123456",
  "content": "Hello, world!",
  "author": {
    "id": "user123456",
    "username": "alice",
    "displayName": "Alice Smith",
    "avatarUrl": "https://example.com/avatars/alice-123456.jpg"
  },
  "attachments": [
    {
      "url": "https://example.com/media/image-123456.jpg",
      "type": "Image",
      "mediaType": "image/jpeg"
    }
  ],
  "createdAt": "2025-04-01T12:30:45.678Z",
  "sensitive": false,
  "contentWarning": "",
  "likes": 5,
  "likedByUser": false,
  "shares": 2
}
```

**Error Responses:**
- Status Code: 404 Not Found
```json
{
  "error": "Post not found"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to get post"
}
```

### PUT /api/posts/:id

Update a post.

**Authentication:** Required

**Path Parameters:**
- `id` (string, required): The ID of the post to update

**Request Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "Updated post content!",
  "sensitive": true,
  "contentWarning": "Contains sensitive content"
}
```

**Success Response:**
- Status Code: 200 OK
- Response Body: Updated post object
```json
{
  "id": "post123456",
  "content": "Updated post content!",
  "author": {
    "id": "user123456",
    "username": "alice",
    "displayName": "Alice Smith",
    "avatarUrl": "https://example.com/avatars/alice-123456.jpg"
  },
  "attachments": [
    {
      "url": "https://example.com/media/image-123456.jpg",
      "type": "Image",
      "mediaType": "image/jpeg"
    }
  ],
  "createdAt": "2025-04-01T12:30:45.678Z",
  "sensitive": true,
  "contentWarning": "Contains sensitive content",
  "likes": 5,
  "likedByUser": true,
  "shares": 2
}
```

**Error Responses:**
- Status Code: 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```
- Status Code: 404 Not Found
```json
{
  "error": "Post not found or not authorized"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to update post"
}
```

### DELETE /api/posts/:id

Delete a post.

**Authentication:** Required

**Path Parameters:**
- `id` (string, required): The ID of the post to delete

**Request Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Success Response:**
- Status Code: 204 No Content
- Response Body: None

**Error Responses:**
- Status Code: 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```
- Status Code: 404 Not Found
```json
{
  "error": "Post not found or not authorized"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to delete post"
}
```

### POST /api/posts/:id/like

Like a post.

**Authentication:** Required

**Path Parameters:**
- `id` (string, required): The ID of the post to like

**Request Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Success Response:**
- Status Code: 200 OK
- Response Body:
```json
{
  "success": true
}
```

**Error Responses:**
- Status Code: 400 Bad Request
```json
{
  "error": "Post already liked or not found"
}
```
- Status Code: 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to like post"
}
```

### POST /api/posts/:id/unlike

Unlike a post.

**Authentication:** Required

**Path Parameters:**
- `id` (string, required): The ID of the post to unlike

**Request Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Success Response:**
- Status Code: 200 OK
- Response Body:
```json
{
  "success": true
}
```

**Error Responses:**
- Status Code: 400 Bad Request
```json
{
  "error": "Post not liked or not found"
}
```
- Status Code: 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to unlike post"
}
```

## Media API

Endpoints for handling media files.

### POST /api/media/upload

Upload a media file.

**Authentication:** Required

**Request Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
- `file` (file, required): The media file to upload

**Note:** This endpoint is not fully implemented in the current version of the API.

**Success Response:**
- Status Code: 501 Not Implemented (currently)
- Response Body:
```json
{
  "message": "Not implemented yet"
}
```

**Error Responses:**
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to upload media"
}
```

### GET /api/media/:id

Get a media file by ID.

**Authentication:** Not required

**Path Parameters:**
- `id` (string, required): The ID of the media to retrieve

**Note:** This endpoint is not fully implemented in the current version of the API.

**Success Response:**
- Status Code: 501 Not Implemented (currently)
- Response Body:
```json
{
  "message": "Not implemented yet"
}
```

**Error Responses:**
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to retrieve media"
}
```

### DELETE /api/media/:id

Delete a media file.

**Authentication:** Required

**Path Parameters:**
- `id` (string, required): The ID of the media to delete

**Request Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Note:** This endpoint is not fully implemented in the current version of the API.

**Success Response:**
- Status Code: 501 Not Implemented (currently)
- Response Body:
```json
{
  "message": "Not implemented yet"
}
```

**Error Responses:**
- Status Code: 500 Internal Server Error
```json
{
  "error": "Failed to delete media"
}
```

## WebFinger API

Endpoint for WebFinger protocol implementation, used for actor discovery in federated networks.

### GET /.well-known/webfinger

Get WebFinger resource for actor discovery.

**Authentication:** Not required

**Query Parameters:**
- `resource` (string, required): Resource URI in the format `acct:username@domain`

**Request Headers:**
- `Content-Type: application/json`

**Success Response:**
- Status Code: 200 OK
- Response Body:
```json
{
  "subject": "acct:alice@example.com",
  "links": [
    {
      "rel": "self",
      "type": "application/activity+json",
      "href": "https://example.com/users/alice"
    }
  ]
}
```

**Error Responses:**
- Status Code: 400 Bad Request
```json
{
  "error": "Resource query parameter is required"
}
```
- Status Code: 400 Bad Request
```json
{
  "error": "Invalid resource format"
}
```
- Status Code: 404 Not Found
```json
{
  "error": "Resource not found"
}
```
- Status Code: 404 Not Found
```json
{
  "error": "User not found"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Server error"
}
```

## ActivityPub API

Endpoints for implementing the ActivityPub protocol for federation.

### GET /users/:username

Get ActivityPub actor profile in Activity Streams 2.0 format.

**Authentication:** Not required

**Path Parameters:**
- `username` (string, required): The username of the actor to retrieve

**Request Headers:**
- `Accept: application/activity+json`

**Success Response:**
- Status Code: 200 OK
- Content-Type: application/activity+json
- Response Body: Actor in ActivityPub format (activity+json)

**Error Responses:**
- Status Code: 404 Not Found
```json
{
  "error": "Actor not found"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Server error"
}
```

### POST /users/:username/inbox

Receive ActivityPub activities from other servers.

**Authentication:** Not required (but requires ActivityPub signature verification)

**Path Parameters:**
- `username` (string, required): The username of the recipient actor

**Request Headers:**
- `Content-Type: application/activity+json`
- Various HTTP Signature headers for authentication

**Request Body:**
- Activity in ActivityPub format (activity+json)

**Success Response:**
- Status Code: 202 Accepted
- Response Body: None

**Error Responses:**
- Status Code: 400 Bad Request
```json
{
  "error": "Invalid activity format"
}
```
- Status Code: 404 Not Found
```json
{
  "error": "Actor not found"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Server error"
}
```

### GET /users/:username/outbox

Get the collection of activities from an actor's outbox.

**Authentication:** Not required

**Path Parameters:**
- `username` (string, required): The username of the actor

**Request Headers:**
- `Accept: application/activity+json`

**Query Parameters:**
- `page` (boolean, optional): If true, returns a specific page of the collection
- `cursor` (string, optional): Cursor for pagination

**Success Response:**
- Status Code: 200 OK
- Content-Type: application/activity+json
- Response Body: Collection of activities in ActivityPub format

**Error Responses:**
- Status Code: 404 Not Found
```json
{
  "error": "Actor not found"
}
```
- Status Code: 500 Internal Server Error
```json
{
  "error": "Server error"
}
```
