import { apiSlice } from "@/store/apiSlice";
import type { IAPIResponse } from "@/types/api/response.types";

interface IStoreScopedRequest {
  storeSlug: string;
}

export interface ICartItemSummary {
  productId: string;
  title: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  inStock: boolean;
}

export interface ICartSummary {
  items: ICartItemSummary[];
  itemsTotal: number;
  shippingEstimate: number;
  grandTotal: number;
}

interface IAddCartItemRequest extends IStoreScopedRequest {
  productId: string;
  quantity?: number;
}

interface IUpdateCartItemRequest extends IStoreScopedRequest {
  productId: string;
  quantity: number;
}

interface IRemoveCartItemRequest extends IStoreScopedRequest {
  productId: string;
}

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<IAPIResponse<ICartSummary>, IStoreScopedRequest>({
      query: ({ storeSlug }) => ({
        url: `stores/${storeSlug}/cart`,
        method: "GET",
      }),
      providesTags: ["Cart"],
    }),

    addCartItem: builder.mutation<IAPIResponse<{ productId: string; quantity: number }>, IAddCartItemRequest>({
      query: ({ storeSlug, productId, quantity = 1 }) => ({
        url: `stores/${storeSlug}/cart/items`,
        method: "POST",
        body: { productId, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    updateCartItem: builder.mutation<IAPIResponse<{ productId: string; quantity: number }>, IUpdateCartItemRequest>({
      query: ({ storeSlug, productId, quantity }) => ({
        url: `stores/${storeSlug}/cart/items/${productId}`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    removeCartItem: builder.mutation<IAPIResponse<null>, IRemoveCartItemRequest>({
      query: ({ storeSlug, productId }) => ({
        url: `stores/${storeSlug}/cart/items/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation<IAPIResponse<null>, IStoreScopedRequest>({
      query: ({ storeSlug }) => ({
        url: `stores/${storeSlug}/cart`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;
