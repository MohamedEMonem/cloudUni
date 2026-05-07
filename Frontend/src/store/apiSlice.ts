import { createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SERVER_DEV_API_URL ||
  '/api';

export const apiSlice = createApi({
  reducerPath: 'apiSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
    credentials: 'include'
  }),
  endpoints: () => ({}),
  tagTypes : [
    "Auth",
    "Category",
    "Product"
  ]
});