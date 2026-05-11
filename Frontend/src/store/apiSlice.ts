import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SERVER_DEV_API_URL ||
  "/api";

const normalizedApiBaseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl : `${apiBaseUrl}/`;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: normalizedApiBaseUrl,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("user");
  localStorage.removeItem("ownerStoreSlug");
};

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshResult = await rawBaseQuery(
      {
        url: "auth/refresh",
        method: "POST",
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const refreshData = refreshResult.data as { data?: { token?: string }; token?: string };
      const refreshedToken = refreshData?.data?.token || refreshData?.token;

      if (refreshedToken) {
        localStorage.setItem("token", refreshedToken);
      }

      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      clearAuthStorage();
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "apiSlice",
  baseQuery: baseQueryWithReauth,
  endpoints: () => ({}),
  tagTypes: [
    "Auth",
    "Category",
    "Product",
    "Store",
    "Cart"
  ],
});