import { Outlet } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { StoreSetup } from "@/features/dashboard/StoreSetup";
import { useOwnerStore } from "@/context/OwnerStoreContext";
import { EUserRole } from "@/types/entities/user.types";
import { Loader2 } from "lucide-react";

export default function DashboardLayout() {
  const role = localStorage.getItem("role");
  const {
    currentStore,
    stores,
    selectedStoreSlug,
    setSelectedStoreSlug,
    isStoreLoading,
    hasStore,
    isStoreError,
  } = useOwnerStore();

  const isCustomer = role === EUserRole.Customer;

  if (isCustomer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl border border-accent-light/50 shadow-sm p-8 max-w-xl text-center">
          <h1 className="text-2xl font-bold text-text-dark mb-3">هذه الصفحة مخصصة للتجار</h1>
          <p className="text-text-muted">يمكنك متابعة التصفح كعميل من الصفحة الرئيسية.</p>
        </div>
      </div>
    );
  }

  if (isStoreLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isStoreError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 max-w-xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-3">تعذر تحميل بيانات المتجر</h1>
          <p className="text-text-muted">تأكد من تسجيل الدخول مرة أخرى وحاول تحديث الصفحة.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-linear-to-br from-bg-cream via-bg-cream to-accent-light"
      dir="rtl"
    >
      <DashboardHeader
        storeName={currentStore?.name ?? "متجري"}
        stores={stores}
        selectedStoreSlug={selectedStoreSlug}
        onStoreChange={setSelectedStoreSlug}
      />

      {/* Dashboard Content */}
      <main className="flex-1 w-full container mx-auto px-4 md:px-4 py-8">
        {hasStore ? <Outlet /> : <StoreSetup />}
      </main>
    </div>
  );
}
