import { apiSlice } from "@/store/apiSlice";
import type { IAPIResponse } from "@/types/api/response.types";
import type { IStore } from "@/types/entities/store.types";

interface IOwnerWithStores {
  id: string;
  name: string;
  email: string;
  role: string;
  ownedStores: IStore[];
}

export interface IGetOwnerStoresResponse {
  numberOfStores: number;
  userAndStores: IOwnerWithStores | null;
}

export interface ICreateStorePayload {
  data: {
    name: string;
    subdomain: string;
    description?: string;
    coverBannerUrl?: string;
    businessAddress?: string;
    vatNumber?: string;
    themeSettings?: Record<string, unknown>;
  };
}

export interface ICreateStoreResponse {
  newStore: {
    store: IStore;
    storeowner: {
      id: string;
      role: string;
    };
  };
}

export const storeApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOwnerStores: builder.query<IAPIResponse<IGetOwnerStoresResponse>, void>({
      query: () => ({
        url: "stores/store",
        method: "GET",
      }),
      providesTags: ["Store"],
    }),

    createStore: builder.mutation<IAPIResponse<ICreateStoreResponse>, ICreateStorePayload>({
      query: (payload) => ({
        url: "stores/create",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Store"],
    }),
  }),
});

export const { useGetOwnerStoresQuery, useCreateStoreMutation } = storeApi;
