import { useNavigate } from "react-router-dom";
import { showNotification } from "@/utils/showNotification";
import { useCreateProductMutation } from "@/api/product.api";
import { ProductForm } from "./components/ProductForm";
import { useOwnerStore } from "@/context/OwnerStoreContext";

export function CreateProduct() {
  const navigate = useNavigate();
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const { currentStore } = useOwnerStore();

  const handleSubmit = async (formData: FormData) => {
    const storeSlug = currentStore?.subdomain;
    const storeId = currentStore?.id;

    if (!storeSlug || !storeId) {
      showNotification({
        message: "لا يمكن إضافة منتج قبل اختيار متجر صالح.",
        variant: "error",
      });
      return;
    }

    try {
      formData.set("storeId", storeId);
      await createProduct({ storeSlug, data: formData }).unwrap();
      
      const productTitle = formData.get("title") as string;
      showNotification({
        message: `${productTitle}\nتم إضافة المنتج بنجاح!`,
        variant: "success",
      });
      navigate("/dashboard/products");
    } catch (error) {
      const productTitle = formData.get("title") as string;
      showNotification({
        message: `${productTitle}\nحدث خطأ أثناء إضافة المنتج. حاول مرة أخرى.`,
        variant: "error",
      });
      console.error("Create Product Error:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <ProductForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
