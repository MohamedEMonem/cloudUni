import { NavLink } from "react-router-dom";
import {
  Store,
  Bell,
  LayoutDashboard,
  Package,
  ShoppingBag,
  User,
  LogOut,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CircleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { StatCard } from "@/components/ui/StatCard";

interface DashboardHeaderProps {
  storeName: string;
}

const navLinks = [
  { name: "نظرة عامة", path: "/dashboard", icon: LayoutDashboard },
  { name: "المنتجات", path: "/dashboard/products", icon: Package },
  { name: "الملف الشخصي", path: "/dashboard/profile", icon: User },
];

export function DashboardHeader({ storeName }: DashboardHeaderProps) {
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  // Pure numerical values from the API
  const statsValues = {
    totalSales: 0,
    isSalesUp: true,
    totalOrders: 0,
    isOrdersUp: true,
    pendingOrders: 0,
    historicalTotal: 0,
    ordersTrend: 12,
    itemsCount: 0,
  };

  return (
    <>
      <header className="bg-linear-to-l from-primary to-primary-light text-white py-6 md:py-10 px-4 md:px-8 shadow-lg">
        <div className="w-full">
          {/* Top Row: User Info + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            {/* Right Section: User & Store Info */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-lg shrink-0">
                <Store className="w-6 h-6 md:w-9 md:h-9" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold mb-1">
                  مرحباً، {user?.name}
                </h1>
                <p className="text-white/80 text-sm md:text-lg truncate max-w-48 md:max-w-none">
                  لوحة تحكم البائع - {storeName}
                </p>
              </div>
            </div>

            {/* Left Section: Actions */}
            <div className="flex items-center gap-2 md:gap-4 self-end sm:self-auto">
              {/* Notification Bell */}
              <div className="relative">
                <Button
                  variant="tertiary"
                  icon={<Bell className="w-6 h-6" />}
                  className="relative p-2 md:p-3 rounded-xl text-white hover:bg-white/10"
                >
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>

              {/* User Dropdown */}
              <div className="relative group/user">
                <Button
                  variant="tertiary"
                  className="relative p-2 rounded-xl text-white hover:bg-white/10"
                >
                  <UserAvatar
                    name={user?.name}
                    avatarUrl={user?.profilePhotoUrl}
                    className="w-8 h-8 md:w-10 md:h-10"
                  />
                </Button>

                {/* Dropdown Menu */}
                <div className="absolute top-12 left-0 pt-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible group-focus-within/user:opacity-100 group-focus-within/user:visible transition-all duration-200 z-50">
                  <div className="w-64 bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col overflow-hidden text-right">
                    <div className="p-4 flex flex-col items-center text-center bg-gray-50/50 border-b border-gray-100">
                      <UserAvatar
                        name={user?.name}
                        avatarUrl={user?.profilePhotoUrl}
                        className="w-12 h-12 mb-2 shadow-sm"
                      />
                      <div className="flex flex-col min-w-0 w-full">
                        <span className="text-base font-bold text-gray-900 truncate">
                          {user?.name}
                        </span>
                        <span className="text-xs text-gray-500 truncate mt-0.5">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                    <div className="p-2 space-y-0.5">
                      <NavLink
                        to="/dashboard/profile"
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${
                            isActive
                              ? "bg-primary text-white shadow-md transform scale-[1.02] [&>svg]:text-white"
                              : "text-gray-700 hover:bg-gray-50 hover:text-primary [&>svg]:text-gray-400 group-hover:text-primary"
                          }`
                        }
                      >
                        <User className="w-4 h-4 transition-colors" />
                        <span>الملف الشخصي</span>
                      </NavLink>
                    </div>
                    <div className="p-2 border-t border-gray-100">
                      <Button
                        variant="hero"
                        onClick={handleLogout}
                        className="gap-3 px-3 py-2.5  text-red-600 hover:bg-red-50  transition-colors  "
                        icon={<LogOut className="w-4 h-4" />}
                      >
                        تسجيل الخروج
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards Area */}
          <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-4 pb-4 md:pb-0 snap-x snap-mandatory">
            <StatCard
              title="إجمالي المبيعات"
              value={`${statsValues.totalSales} ج.م`}
              icon={<DollarSign className="w-8 h-8 text-accent" />}
              className="min-w-64 md:min-w-0 snap-center shrink-0"
              action={
                statsValues.isSalesUp ? (
                  <TrendingUp className="w-5 h-5 text-emerald-300" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )
              }
            />
            <StatCard
              title="إجمالي الطلبات"
              value={statsValues.totalOrders}
              icon={<ShoppingBag className="w-8 h-8 text-accent-light" />}
              className="min-w-64 md:min-w-0 snap-center shrink-0"
              action={
                statsValues.isOrdersUp ? (
                  <span className="text-sm font-medium text-emerald-300">
                    +{statsValues.ordersTrend}%
                  </span>
                ) : (
                  <span className="text-sm font-medium text-red-400">
                    -{statsValues.ordersTrend}%
                  </span>
                )
              }
            />
            <StatCard
              title="طلبات قيد التنفيذ"
              value={statsValues.pendingOrders}
              icon={<Clock className="w-8 h-8 text-amber-300" />}
              className="min-w-64 md:min-w-0 snap-center shrink-0"
              action={<CircleAlert className="w-5 h-5 text-amber-300" />}
            />
            <StatCard
              title="إجمالي المبيعات التاريخية"
              value={statsValues.historicalTotal}
              icon={<Package className="w-8 h-8 text-blue-300" />}
              className="min-w-64 md:min-w-0 snap-center shrink-0"
              action={
                <span className="text-sm font-medium text-white/60">
                  {statsValues.itemsCount} منتج
                </span>
              }
            />
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <div className="container mx-auto px-4 md:px-4 mt-6">
        <div className="overflow-x-auto pb-2 -mb-2">
          <nav className="bg-white border-2 border-accent-light rounded-full p-1 inline-flex items-center  gap-1 w-max shadow-md">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full transition-all text-xs md:text-sm font-medium whitespace-nowrap ${
                    isActive
                      ? "bg-primary text-white shadow-md"
                      : "text-text-dark hover:bg-gray-50"
                  }`
                }
              >
                <link.icon className="w-4 h-4" />
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
