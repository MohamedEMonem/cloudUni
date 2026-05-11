import { useNavigate, useParams } from "react-router-dom";
import { showNotification } from "@/utils/showNotification";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "@/api/product.api";
import { ProductForm } from "./components/ProductForm";
import { Loader2 } from "lucide-react";
import { useOwnerStore } from "@/context/OwnerStoreContext";

export function UpdateProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentStore } = useOwnerStore();

  const storeSlug = currentStore?.subdomain;

  const {
    data: response,
    isLoading: isFetching,
    isError,
  } = useGetProductByIdQuery(
    { id: id ?? "", storeSlug: storeSlug ?? "" },
    { skip: !id || !storeSlug },
  );

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const productData = response?.data;

  const handleSubmit = async (formData: FormData) => {
    const data = Object.fromEntries(
      Array.from(formData.entries()).filter(([, value]) => !(value instanceof File)),
    );

    try {
      if (!id || !storeSlug) return;
      await updateProduct({ id, data: data as any, storeSlug }).unwrap();

      const productTitle = formData.get("title") as string;
      showNotification({
        message: `${productTitle}\nتم تحديث المنتج بنجاح!`,
        variant: "success",
      });
      navigate("/dashboard/products");
    } catch (error) {
      const productTitle = formData.get("title") as string;
      showNotification({
        message: `${productTitle}\nحدث خطأ أثناء تحديث المنتج. حاول مرة أخرى.`,
        variant: "error",
      });
      console.error("Update Product Error:", error);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !productData) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>فشل في تحميل بيانات المنتج أو المنتج غير موجود.</p>
        <button
          onClick={() => navigate("/dashboard/products")}
          className="mt-4 text-primary underline"
        >
          العودة لقائمة المنتجات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <ProductForm
        initialData={productData}
        onSubmit={handleSubmit}
        isLoading={isUpdating}
      />
    </div>
  );
}
