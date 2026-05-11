import { apiSlice } from "@/store/apiSlice";
import { IAPIResponse } from "@/types/api/response.types";
import { IProduct } from "@/types/entities/product.types";
import { UpdateProductDTO } from "@/types/dto/product.dto";

interface IStoreScopedRequest {
  storeSlug: string;
}

interface IStoreProductByIdRequest extends IStoreScopedRequest {
  id: string;
}

interface ICreateProductRequest extends IStoreScopedRequest {
  data: FormData;
}

interface IUpdateProductRequest extends IStoreScopedRequest, UpdateProductDTO {}

export const productApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query<
      IAPIResponse<IProduct[]>,
      IStoreScopedRequest
    >({
      query: ({ storeSlug }) => ({
        url: `stores/${storeSlug}/products`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),

    getProductById: builder.query<
      IAPIResponse<IProduct>,
      IStoreProductByIdRequest
    >({
      query: ({ id, storeSlug }) => ({
        url: `stores/${storeSlug}/products/${id}`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),

    createProduct: builder.mutation<
      IAPIResponse<IProduct>,
      ICreateProductRequest
    >({
      query: ({ storeSlug, data }) => ({
        url: `stores/${storeSlug}/products`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation<
      IAPIResponse<IProduct>,
      IUpdateProductRequest
    >({
      query: ({ storeSlug, id, data }) => ({
        url: `stores/${storeSlug}/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation<
      IAPIResponse<null>,
      IStoreProductByIdRequest
    >({
      query: ({ id, storeSlug }) => ({
        url: `stores/${storeSlug}/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    getProductsByStoreId: builder.query<
      IAPIResponse<IProduct[]>,
      IStoreScopedRequest & { storeId: string }
    >({
      query: ({ storeSlug, storeId }) => ({
        url: `stores/${storeSlug}/products?storeId=${storeId}`,
        method: "GET",
      }),
      providesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductsByStoreIdQuery,
  useCreateProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
} = productApi;
