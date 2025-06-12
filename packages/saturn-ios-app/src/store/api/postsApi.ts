import { baseApi } from './baseApi';
import { ApiEndpoints } from '../../config/api';

// Post type definition
export interface Post {
  _id: string;
  id: string;
  content: string;
  createdAt: string;
  author: {
    _id: string;
    id: string;
    username: string;
    displayName?: string;
    icon?: { url: string };
    avatarUrl?: string;
  };
  likesCount?: number;
  commentsCount?: number;
}

export interface CreatePostData {
  content: string;
  attachments?: string[]; // Media IDs
}

export interface FeedResponse {
  posts: Post[];
  hasMore?: boolean;
}

// Posts API slice
export const postsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query<Post[], void>({
      query: () => ApiEndpoints.posts,
      transformResponse: (response: unknown): Post[] => {
        // Handle different response formats from the server
        if (Array.isArray(response)) {
          return response as Post[];
        }
        
        if (response && typeof response === 'object' && 'posts' in response) {
          const postsObj = response as { posts: unknown };
          if (Array.isArray(postsObj.posts)) {
            return postsObj.posts as Post[];
          }
        }
        
        if (response && typeof response === 'object' && 'data' in response) {
          const dataObj = response as { data: unknown };
          if (dataObj.data && typeof dataObj.data === 'object' && 'posts' in dataObj.data) {
            const nestedPostsObj = dataObj.data as { posts: unknown };
            if (Array.isArray(nestedPostsObj.posts)) {
              return nestedPostsObj.posts as Post[];
            }
          }
        }
        
        // Handle single post response
        if (response && typeof response === 'object') {
          const postObj = response as Record<string, unknown>;
          if ((postObj.id || postObj._id) && postObj.content) {
            return [postObj as Post];
          }
        }
        
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),
    
    createPost: builder.mutation<Post, CreatePostData>({
      query: (postData) => ({
        url: ApiEndpoints.posts,
        method: 'POST',
        body: postData,
      }),
      transformResponse: (response: unknown): Post => {
        // Handle nested response structure
        if (response && typeof response === 'object' && 'data' in response) {
          const dataObj = response as { data: unknown };
          return dataObj.data as Post;
        }
        return response as Post;
      },
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useCreatePostMutation,
} = postsApi;