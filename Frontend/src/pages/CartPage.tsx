import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from "@/api/cart.api";
import { showNotification } from "@/utils/showNotification";

export default function CartPage() {
  const token = localStorage.getItem("token");
  const storeSlug = localStorage.getItem("ownerStoreSlug") ?? "";

  const { data, isLoading, isError } = useGetCartQuery(
    { storeSlug },
    { skip: !token || !storeSlug },
  );

  const [updateCartItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeCartItem, { isLoading: isRemoving }] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();

  const cart = data?.data;
  const items = cart?.items ?? [];

  const changeQuantity = async (productId: string, nextQuantity: number) => {
    try {
      await updateCartItem({ storeSlug, productId, quantity: nextQuantity }).unwrap();
    } catch {
      showNotification({
        message: "تعذر تحديث الكمية حالياً.",
        variant: "error",
      });
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await removeCartItem({ storeSlug, productId }).unwrap();
      showNotification({ message: "تم حذف العنصر من السلة.", variant: "success" });
    } catch {
      showNotification({ message: "تعذر حذف العنصر.", variant: "error" });
    }
  };

  const clearAll = async () => {
    try {
      await clearCart({ storeSlug }).unwrap();
      showNotification({ message: "تم تفريغ السلة بنجاح.", variant: "success" });
    } catch {
      showNotification({ message: "تعذر تفريغ السلة.", variant: "error" });
    }
  };

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-10" dir="rtl">
        <div className="bg-white rounded-xl border border-accent-light/50 p-8 text-center">
          <h1 className="text-2xl font-bold mb-3">سلة التسوق</h1>
          <p className="text-text-muted">يرجى تسجيل الدخول أولاً للوصول إلى السلة.</p>
        </div>
      </div>
    );
  }

  if (!storeSlug) {
    return (
      <div className="container mx-auto px-4 py-10" dir="rtl">
        <div className="bg-white rounded-xl border border-accent-light/50 p-8 text-center">
          <h1 className="text-2xl font-bold mb-3">سلة التسوق</h1>
          <p className="text-text-muted">لا يوجد متجر محدد حالياً لاستخدام السلة.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10" dir="rtl">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-dark flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" />
          سلة التسوق
        </h1>

        <Button
          variant="outline-accent"
          className="w-auto! h-9!"
          onClick={clearAll}
          disabled={isClearing || items.length === 0}
        >
          تفريغ السلة
        </Button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-xl border border-accent-light/50 p-8 text-center">جاري تحميل السلة...</div>
      ) : isError ? (
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center text-red-600">حدث خطأ أثناء تحميل السلة.</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-accent-light/50 p-8 text-center text-text-muted">السلة فارغة حالياً.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-accent-light/50 overflow-hidden">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-accent-light/50 text-text-muted">
                  <th className="p-4">المنتج</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4">الكمية</th>
                  <th className="p-4">الإجمالي</th>
                  <th className="p-4">إزالة</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.productId} className="border-b border-accent-light/20">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200"}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-lg border border-accent-light/40"
                        />
                        <span className="font-medium text-text-dark">{item.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-primary font-semibold">{item.unitPrice} ج.م</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="tertiary"
                          className="size-8! p-0"
                          onClick={() => changeQuantity(item.productId, Math.max(0, item.quantity - 1))}
                          disabled={isUpdating || isRemoving}
                          icon={<Minus className="w-4 h-4" />}
                        />
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="tertiary"
                          className="size-8! p-0"
                          onClick={() => changeQuantity(item.productId, item.quantity + 1)}
                          disabled={isUpdating || isRemoving}
                          icon={<Plus className="w-4 h-4" />}
                        />
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-text-dark">{item.lineTotal} ج.م</td>
                    <td className="p-4">
                      <Button
                        variant="tertiary"
                        className="size-8! p-0 text-red-500 hover:bg-red-50"
                        onClick={() => removeItem(item.productId)}
                        disabled={isRemoving || isUpdating}
                        icon={<Trash2 className="w-4 h-4" />}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-accent-light/50 p-5 h-fit">
            <h2 className="text-lg font-bold mb-4">ملخص الطلب</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">إجمالي المنتجات</span>
                <span>{cart?.itemsTotal ?? 0} ج.م</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">الشحن</span>
                <span>{cart?.shippingEstimate ?? 0} ج.م</span>
              </div>
              <div className="pt-3 border-t border-accent-light/50 flex items-center justify-between font-bold text-base">
                <span>الإجمالي النهائي</span>
                <span className="text-primary">{cart?.grandTotal ?? 0} ج.م</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
