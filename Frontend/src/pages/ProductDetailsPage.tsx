import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Loader2, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useGetProductByIdQuery } from "@/api/product.api";
import { useAddCartItemMutation } from "@/api/cart.api";
import { showNotification } from "@/utils/showNotification";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const storeSlugFromQuery = searchParams.get("store");
  const fallbackStoreSlug = localStorage.getItem("ownerStoreSlug");
  const storeSlug = useMemo(
    () => storeSlugFromQuery || fallbackStoreSlug || "",
    [fallbackStoreSlug, storeSlugFromQuery],
  );

  const { data, isLoading, isError } = useGetProductByIdQuery(
    { storeSlug, id: id ?? "" },
    { skip: !storeSlug || !id },
  );

  const [addCartItem, { isLoading: isAdding }] = useAddCartItemMutation();

  const product = data?.data;

  const handleAddToCart = async () => {
    if (!product || !storeSlug) return;

    try {
      await addCartItem({
        storeSlug,
        productId: product.id,
        quantity: 1,
      }).unwrap();

      showNotification({
        message: "تمت إضافة المنتج إلى السلة.",
        variant: "success",
      });
    } catch (error: any) {
      const errorMessage = error?.data?.message || "تعذر إضافة المنتج إلى السلة.";
      showNotification({ message: errorMessage, variant: "error" });
    }
  };

  if (!storeSlug) {
    return (
      <div className="container mx-auto px-4 py-10" dir="rtl">
        <div className="bg-white rounded-xl border border-accent-light/50 p-8 text-center text-text-muted">
          لا يمكن تحميل المنتج بدون تحديد المتجر. أضف store في الرابط.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10" dir="rtl">
        <div className="bg-white rounded-xl border border-accent-light/50 p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-10" dir="rtl">
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center text-red-600">
          تعذر تحميل المنتج.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10" dir="rtl">
      <div className="bg-white rounded-2xl border border-accent-light/50 overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-0">
        <div className="bg-bg-cream min-h-80 flex items-center justify-center p-6">
          <img
            src={product.images?.[0]?.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"}
            alt={product.title}
            className="max-h-96 w-full object-contain"
          />
        </div>

        <div className="p-6 lg:p-8 flex flex-col">
          <h1 className="text-2xl font-bold text-text-dark mb-3">{product.title}</h1>
          <p className="text-text-muted leading-7 mb-6">{product.description || "لا يوجد وصف لهذا المنتج."}</p>

          <div className="space-y-2 mb-8 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">السعر</span>
              <span className="text-primary font-bold text-lg">{product.price} ج.م</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">المخزون</span>
              <span className="font-semibold">{product.stockQuantity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">الحالة</span>
              <span className="font-semibold">{product.status === "Active" ? "نشط" : "غير نشط"}</span>
            </div>
          </div>

          <div className="mt-auto flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              className="w-full h-10!"
              icon={<ShoppingCart className="w-4 h-4" />}
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? "جاري الإضافة..." : "إضافة إلى السلة"}
            </Button>
            <Button variant="outline-accent" className="w-full h-10!" onClick={() => navigate(-1)}>
              عودة
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
