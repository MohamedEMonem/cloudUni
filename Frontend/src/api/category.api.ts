import { apiSlice } from "@/store/apiSlice";
import { IAPIResponse } from "@/types/api/response.types";
import { ICategory } from "@/types/entities/category.types";
import { CreateCategoryDTO, UpdateCategoryDTO } from "@/types/dto/category.dto";

export const categoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<
      IAPIResponse<ICategory[]>,
      void
    >({
      query: () => ({
        url: "categories",
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    createCategory: builder.mutation<
      IAPIResponse<ICategory>,
      CreateCategoryDTO
    >({  
      query: (categoryData) => ({
        url: "categories",
        method: "POST",
        body: categoryData,
      }),
      invalidatesTags: ["Category"],
    }),

    updateCategory: builder.mutation<
      IAPIResponse<ICategory>,
      UpdateCategoryDTO
    >({
      query: ({ id, data }) => ({
        url: `categories/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation<
      IAPIResponse<null>,
      { id: string }
    >({
      query: ({ id }) => ({
        url: `categories/${id}`,
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
