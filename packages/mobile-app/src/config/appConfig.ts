export const appConfig = {
  // Base URL for API requests
  apiBaseUrl: 'http://localhost:4000/', // Replace with your actual production API URL

  // API endpoints
  endpoints: {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      me: '/api/auth/me',
    },
    actors: {
      getUserProfile: '/api/actors/:username',
      searchActors: '/api/actors/search',
      updateActor: '/api/actors/:username', // Used for PUT requests to update an actor
      deleteActor: '/api/actors/:username',
      // The getUserPosts endpoint is not documented in API.
      // Consider confirming with backend team if this endpoint exists.
      // getUserPosts: '/api/actors/:username/posts',
    },
    posts: {
      feed: '/api/posts', // This is used for GET requests to fetch the feed
      createPost: '/api/posts', // This is used for POST requests to create a new post
      getPost: '/api/posts/:id',
      updatePost: '/api/posts/:id',
      deletePost: '/api/posts/:id',
      likePost: '/api/posts/:id/like',
      unlikePost: '/api/posts/:id/unlike',
    },
    media: {
      upload: '/api/media/upload', // Note: API docs indicate this is not fully implemented (501)
      getMedia: '/api/media/:id', // Note: API docs indicate this is not fully implemented (501)
      deleteMedia: '/api/media/:id', // Note: API docs indicate this is not fully implemented (501)
    },
  },
};

export default appConfig;
