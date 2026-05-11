import { apiSlice } from "@/store/apiSlice";
import { IAPIResponse } from "@/types/api/response.types";
import { ICategory } from "@/types/entities/category.types";
import { CreateCategoryDTO, UpdateCategoryDTO } from "@/types/dto/category.dto";

interface IStoreScopedRequest {
  storeSlug: string;
}

interface IStoreCategoryByIdRequest extends IStoreScopedRequest {
  id: string;
}

interface IStoreCreateCategoryRequest extends IStoreScopedRequest {
  data: CreateCategoryDTO;
}

interface IStoreUpdateCategoryRequest extends IStoreScopedRequest, UpdateCategoryDTO {}

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<
      IAPIResponse<ICategory[]>,
      IStoreScopedRequest
    >({
      query: ({ storeSlug }) => ({
        url: `stores/${storeSlug}/categories`,
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation<
      IAPIResponse<ICategory>,
      IStoreCreateCategoryRequest
    >({
      query: ({ storeSlug, data }) => ({
        url: `stores/${storeSlug}/categories`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<
      IAPIResponse<ICategory>,
      IStoreUpdateCategoryRequest
    >({
      query: ({ id, data, storeSlug }) => ({
        url: `stores/${storeSlug}/categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<
      IAPIResponse<null>,
      IStoreCategoryByIdRequest
    >({
      query: ({ id, storeSlug }) => ({
        url: `stores/${storeSlug}/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
