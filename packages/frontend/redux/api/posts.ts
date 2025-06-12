import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

export interface Post {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface FeedResponse {
  posts: Post[];
  pagination: {
    hasMore: boolean;
    total: number;
  };
}

export interface CreatePostRequest {
  content: string;
}

export const postsApi = createApi({
  reducerPath: "postsApi", 
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.EXPO_PUBLIC_API_URL}/api`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Post"],
  endpoints: (builder) => ({
    getFeed: builder.query<FeedResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: "/posts/feed",
        method: "GET",
        params: { page, limit },
      }),
      providesTags: ["Post"],
    }),
    createPost: builder.mutation<Post, CreatePostRequest>({
      query: (body) => ({
        url: "/posts",
        method: "POST", 
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Post"],
    }),
  }),
});

export const { useGetFeedQuery, useCreatePostMutation } = postsApi;