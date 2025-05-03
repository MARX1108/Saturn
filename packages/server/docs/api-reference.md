# Saturn API Reference

This document provides comprehensive API documentation for the Saturn backend services. It details all available endpoints, their request/response formats, authentication requirements, and usage examples.

## Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [API Endpoints](#api-endpoints)
   - [Auth](#auth)
   - [Actors](#actors)
   - [Posts](#posts)
   - [Comments](#comments)
   - [Notifications](#notifications)
   - [Media](#media)
   - [WebFinger/ActivityPub](#webfingeractivitypub)

## Base URL

All API endpoints are relative to the base URL of your Saturn server:

```
https://saturn.com
```

## Authentication

Many endpoints require authentication. Authentication is managed through JSON Web Tokens (JWT).

### Authentication Header

For protected endpoints, include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Obtaining a Token

To obtain a token, use the login endpoint (see Auth API section below).

## Error Handling

Errors are returned with appropriate HTTP status codes and a JSON body with details:

```json
{
  "status": "error",
  "type": "VALIDATION", // ERROR TYPE
  "error": "Error message",
  "details": {} // Optional details, only included for validation errors
}
```

Common error types:

- `VALIDATION` - Request data validation failed
- `NOT_FOUND` - Requested resource not found
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Permission denied
- `SERVER_ERROR` - Internal server error

## Rate Limiting

The API employs rate limiting to prevent abuse. If you exceed rate limits, you'll receive a 429 (Too Many Requests) status code. Different endpoints have different rate limits:

- Auth endpoints: Stricter limits to prevent brute-force attacks
- Post creation: Limited to prevent spam
- Engagement actions (likes, comments): Moderate limits

## API Endpoints

### Auth

#### Register User

```
POST /api/auth/register
```

Create a new user account.

**Request Body:**

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**

```json
{
  "id": "user123",
  "username": "johndoe",
  "token": "jwt_token_here"
}
```

#### Login

```
POST /api/auth/login
```

Login and receive an authentication token.

**Request Body:**

```json
{
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "user123",
    "username": "johndoe"
  },
  "token": "jwt_token_here"
}
```

#### Get Current User

```
GET /api/auth/me
```

Get details of currently authenticated user.

**Authorization Required:** Yes

**Response (200 OK):**

```json
{
  "id": "user123",
  "username": "johndoe",
  "email": "john@example.com",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

### Actors

Actors represent users in the federated social network.

#### Get Actor by Username

```
GET /api/actors/:username
```

Get an actor's profile by username.

**Response (200 OK):**

```json
{
  "id": "actor123",
  "username": "johndoe",
  "preferredUsername": "John Doe",
  "type": "Person",
  "inbox": "https://example.com/users/johndoe/inbox",
  "outbox": "https://example.com/users/johndoe/outbox",
  "followers": "https://example.com/users/johndoe/followers",
  "following": "https://example.com/users/johndoe/following"
}
```

#### Search Actors

```
GET /api/actors/search?q=searchterm
```

Search for actors by username or display name.

**Query Parameters:**

- `q` - Search term

**Response (200 OK):**

```json
{
  "actors": [
    {
      "id": "actor123",
      "username": "johndoe",
      "preferredUsername": "John Doe"
    }
  ]
}
```

#### Get Actor Posts

```
GET /api/actors/:username/posts
```

Get posts created by an actor.

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200 OK):**

```json
{
  "posts": [
    {
      "id": "post123",
      "content": "Post content",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "likes": 5,
      "commentsCount": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalItems": 48
  }
}
```

#### Update Actor

```
PUT /api/actors/:id
```

Update an actor's profile information.

**Authorization Required:** Yes (must be the actor owner)

**Request Body:**

```json
{
  "preferredUsername": "Updated Name",
  "summary": "Updated bio information"
}
```

**Response (200 OK):**

```json
{
  "id": "actor123",
  "username": "johndoe",
  "preferredUsername": "Updated Name",
  "summary": "Updated bio information"
}
```

### Posts

#### Get Feed

```
GET /api/posts
```

Get the authenticated user's feed of posts.

**Authorization Required:** Yes

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200 OK):**

```json
{
  "posts": [
    {
      "id": "post123",
      "content": "Post content",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "actor": {
        "id": "actor123",
        "username": "johndoe",
        "preferredUsername": "John Doe"
      },
      "likes": 5,
      "commentsCount": 2,
      "isLiked": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalItems": 48
  }
}
```

#### Get Post by ID

```
GET /api/posts/:id
```

Get a specific post by its ID.

**Response (200 OK):**

```json
{
  "id": "post123",
  "content": "Post content",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "actor": {
    "id": "actor123",
    "username": "johndoe",
    "preferredUsername": "John Doe"
  },
  "likes": 5,
  "commentsCount": 2,
  "isLiked": false
}
```

#### Get Posts by Username

```
GET /api/posts/users/:username
```

Get posts by a specific user.

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200 OK):**

```json
{
  "posts": [
    {
      "id": "post123",
      "content": "Post content",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "likes": 5,
      "commentsCount": 2,
      "isLiked": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 2,
    "totalItems": 15
  }
}
```

#### Create Post

```
POST /api/posts
```

Create a new post.

**Authorization Required:** Yes

**Request Body:**

```json
{
  "content": "New post content",
  "attachments": [] // Optional media attachments
}
```

**Response (201 Created):**

```json
{
  "id": "post123",
  "content": "New post content",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "actor": {
    "id": "actor123",
    "username": "johndoe"
  }
}
```

#### Update Post

```
PUT /api/posts/:id
```

Update an existing post.

**Authorization Required:** Yes (must be post owner)

**Request Body:**

```json
{
  "content": "Updated post content"
}
```

**Response (200 OK):**

```json
{
  "id": "post123",
  "content": "Updated post content",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-02T00:00:00.000Z"
}
```

#### Delete Post

```
DELETE /api/posts/:id
```

Delete an existing post.

**Authorization Required:** Yes (must be post owner)

**Response (204 No Content)**

#### Like Post

```
POST /api/posts/:id/like
```

Like a post.

**Authorization Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "likes": 6
}
```

#### Unlike Post

```
POST /api/posts/:id/unlike
```

Unlike a previously liked post.

**Authorization Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "likes": 5
}
```

### Comments

#### Get Comments for Post

```
GET /api/comments/:postId
```

Get comments for a specific post.

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200 OK):**

```json
{
  "comments": [
    {
      "id": "comment123",
      "content": "Comment content",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "actor": {
        "id": "actor123",
        "username": "johndoe",
        "preferredUsername": "John Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalItems": 2
  }
}
```

#### Create Comment

```
POST /api/comments
```

Create a new comment on a post.

**Authorization Required:** Yes

**Request Body:**

```json
{
  "postId": "post123",
  "content": "Comment content"
}
```

**Response (201 Created):**

```json
{
  "id": "comment123",
  "content": "Comment content",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "actor": {
    "id": "actor123",
    "username": "johndoe"
  },
  "postId": "post123"
}
```

#### Delete Comment

```
DELETE /api/comments/:commentId
```

Delete a comment.

**Authorization Required:** Yes (must be comment owner)

**Response (204 No Content)**

### Notifications

#### Get Notifications

```
GET /api/notifications
```

Get notifications for the authenticated user.

**Authorization Required:** Yes

**Query Parameters:**

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `read` - Filter by read status (optional, boolean)

**Response (200 OK):**

```json
{
  "notifications": [
    {
      "id": "notif123",
      "type": "LIKE",
      "read": false,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "actor": {
        "id": "actor123",
        "username": "johndoe",
        "preferredUsername": "John Doe"
      },
      "post": {
        "id": "post123",
        "content": "Post preview..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "totalItems": 5
  }
}
```

#### Mark Notifications as Read

```
POST /api/notifications/mark-read
```

Mark specific notifications as read.

**Authorization Required:** Yes

**Request Body:**

```json
{
  "notificationIds": ["notif123", "notif124"]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "updated": 2
}
```

#### Mark All Notifications as Read

```
POST /api/notifications/mark-all-read
```

Mark all notifications as read.

**Authorization Required:** Yes

**Response (200 OK):**

```json
{
  "success": true,
  "updated": 5
}
```

#### Get Unread Notification Count

```
GET /api/notifications/unread-count
```

Get the count of unread notifications.

**Authorization Required:** Yes

**Response (200 OK):**

```json
{
  "count": 3
}
```

### Media

#### Upload Media

```
POST /api/media/upload
```

Upload media file.

**Authorization Required:** Yes

**Request Body:**
Form data with a file field named 'file'

**Response (201 Created):**

```json
{
  "id": "media123",
  "url": "https://example.com/media/file123.jpg",
  "type": "image/jpeg",
  "size": 1024000
}
```

#### Get Media

```
GET /api/media/:id
```

Get media details.

**Response (200 OK):**

```json
{
  "id": "media123",
  "url": "https://example.com/media/file123.jpg",
  "type": "image/jpeg",
  "size": 1024000,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

#### Delete Media

```
DELETE /api/media/:id
```

Delete media file.

**Authorization Required:** Yes (must be media owner)

**Response (204 No Content)**

### WebFinger/ActivityPub

These endpoints are primarily for federation with other ActivityPub servers and may not be used directly by the frontend.

#### WebFinger

```
GET /.well-known/webfinger?resource=acct:username@domain.com
```

WebFinger discovery endpoint.

**Response (200 OK):**
JSON Resource Descriptor (JRD) format

#### ActivityPub Actor

```
GET /users/:username
```

Get ActivityPub actor representation.

**Response (200 OK):**
ActivityPub Actor object

## Common Patterns and Best Practices

### Pagination

Most endpoints that return collections support pagination with the following query parameters:

- `page` - Page number (starting from 1)
- `limit` - Number of items per page (default is typically 10)

Responses include a pagination object with metadata:

```json
"pagination": {
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "totalItems": 48
}
```

### Date Formats

All dates are returned in ISO 8601 format (UTC):

```
YYYY-MM-DDTHH:mm:ss.sssZ
```

### ID Formats

IDs are typically returned as strings, often in MongoDB ObjectId format.

## Error Codes

| HTTP Status | Description                                                          |
| ----------- | -------------------------------------------------------------------- |
| 400         | Bad Request - Usually indicates validation error                     |
| 401         | Unauthorized - Authentication required                               |
| 403         | Forbidden - Authenticated but insufficient permissions               |
| 404         | Not Found - Resource not found                                       |
| 422         | Unprocessable Entity - Request understood but semantically incorrect |
| 429         | Too Many Requests - Rate limit exceeded                              |
| 500         | Internal Server Error - Server-side error                            |
