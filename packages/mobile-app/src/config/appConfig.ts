export const appConfig = {
  // Base URL for API requests
  apiBaseUrl: 'http://localhost:4000',

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
      updateActor: '/api/actors/:username',
      deleteActor: '/api/actors/:username',
    },
    posts: {
      feed: '/api/posts',
      createPost: '/api/posts', // POST endpoint for creating new posts
      getPost: '/api/posts/:id',
      updatePost: '/api/posts/:id',
      deletePost: '/api/posts/:id',
      likePost: '/api/posts/:id/like',
      getUserPosts: '/api/users/:username/posts', // Moved from actors to posts namespace
    },
    media: {
      upload: '/api/media/upload',
      getMedia: '/api/media/:id',
      deleteMedia: '/api/media/:id',
    },
  },
};

export default appConfig;
