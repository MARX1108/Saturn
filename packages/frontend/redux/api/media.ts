import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

export interface MediaUploadResponse {
  id: string;
  url: string;
  type: string;
  filename: string;
  size: number;
  createdAt: string;
}

export interface MediaUploadRequest {
  file: File | FormData;
  type: "image" | "video" | "audio";
}

export const mediaApi = createApi({
  reducerPath: "mediaApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.EXPO_PUBLIC_API_URL}/api/media`,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).user.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Media"],
  endpoints: (builder) => ({
    uploadMedia: builder.mutation<MediaUploadResponse, FormData>({
      query: (formData) => ({
        url: "/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Media"],
    }),
  }),
});

export const { useUploadMediaMutation } = mediaApi;