import { baseApi } from './baseApi';
import { ApiEndpoints } from '../../config/api';

// Media type definition
export interface MediaItem {
  id: string;
  url: string;
  type: string;
  size: number;
  createdAt?: string;
}

export interface MediaUploadResponse {
  id: string;
  url: string;
  type: string;
  size: number;
}

// Media API slice
export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadMedia: builder.mutation<MediaUploadResponse, FormData>({
      query: (formData) => ({
        url: `${ApiEndpoints.posts}/media/upload`.replace('/api/posts', '/api/media'),
        method: 'POST',
        body: formData,
        // Don't set content-type header for FormData - let the browser set it
        formData: true,
      }),
      invalidatesTags: ['Media'],
    }),
  }),
});

export const {
  useUploadMediaMutation,
} = mediaApi;