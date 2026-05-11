import { DashboardCard } from "@/components/ui/DashboardCard";
import { TrendingUp, ShoppingBag, Package, ChevronLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";

export function Overview() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 w-full">
      {/* Sales Growth Card */}
      <DashboardCard
        title="نمو المبيعات - آخر 6 أشهر"
        icon={<TrendingUp className="w-6 h-6 text-primary" />}
      >
        <div className="h-72 p-6 flex items-center justify-center bg-bg-cream rounded-lg border-2 border-dashed border-accent-light w-full">
          <p className="text-text-muted">مساحة الرسم البياني (Analytics)</p>
        </div>
      </DashboardCard>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        
        {/* Latest Orders Card */}
        <DashboardCard
          title="أحدث الطلبات"
          icon={<ShoppingBag className="w-6 h-6 text-primary" />}
          headerAction={
            <Button
              variant="tertiary"
              className="text-primary hover:text-primary-dark px-3 h-8! text-sm gap-1"
              onClick={() => navigate("/dashboard/products")}
            >
              إدارة المنتجات <ChevronLeft className="w-4 h-4" />
            </Button>
          }
          className="h-full"
        >
          <div className="p-8 text-center text-text-muted">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-accent-light" />
            <p>لا توجد طلبات حتى الآن</p>
          </div>
        </DashboardCard>

        {/* Top Products Card */}
        <DashboardCard
          title="المنتجات الأكثر مبيعاً"
          icon={<TrendingUp className="w-6 h-6 text-accent" />}
          headerAction={
            <Button
              variant="tertiary"
              className="text-primary hover:text-primary-dark px-3 h-8! text-sm gap-1"
              onClick={() => navigate("/dashboard/products")}
            >
              عرض الكل <ChevronLeft className="w-4 h-4" />
            </Button>
          }
          className="h-full"
        >
          <div className="p-8 text-center text-text-muted flex flex-col items-center justify-center">
            <Package className="w-12 h-12 mx-auto mb-4 text-accent-light" />
            <p className="mb-4">لا توجد منتجات حتى الآن</p>
            <Button
              variant="primary"
              className="w-auto! px-4 py-2 text-sm"
              icon={<Plus className="w-4 h-4 ml-2" />}
            >
              إضافة أول منتج
            </Button>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
