import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  ShoppingCart,
  Heart,
  Menu,
  Search,
  Store,
  ChevronDown,
  User,
  X,
  Package,
  LogIn,
  LogOut,
  ShoppingBag,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/UserAvatar";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SubItem {
  label: string;
  href: string;
}

interface NavItemData {
  label: string;
  href: string;
  icon?: ReactNode;
  subItems?: SubItem[];
}

// ─── Nav Data ────────────────────────────────────────────────────────────────
const navItems: NavItemData[] = [
  {
    label: "المنتجات",
    href: "/products",
    icon: <Package className="w-5 h-5 text-primary" />,
    subItems: [
      { label: "الإلكترونيات", href: "/products?cat=electronics" },
      { label: "الموضة والأزياء", href: "/products?cat=fashion" },
      { label: "المنزل والمعيشة", href: "/products?cat=home" },
      { label: "مستحضرات التجميل", href: "/products?cat=beauty" },
      { label: "الرياضة", href: "/products?cat=sports" },
      { label: "الكتب", href: "/products?cat=books" },
    ],
  },
];

const iconActions = [
  {
    icon: <Heart className="w-5 h-5 text-text-dark" />,
    href: "/products",
    ariaLabel: "المفضلة",
    label: "المنتجات",
  },
  {
    icon: <ShoppingCart className="w-5 h-5 text-text-dark" />,
    href: "/cart",
    ariaLabel: "سلة التسوق",
    label: "سلة التسوق",
  },
];

const userActions = [
  {
    label: "الملف الشخصي",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    label: "لوحة التحكم",
    href: "/dashboard",
    icon: ShoppingBag,
  },
];

// ─── Styles ──────────────────────────────────────────────────────────────────
const navLinkVariant = (isActive: boolean) =>
  isActive
    ? "bg-linear-to-r from-primary to-primary-light text-white shadow-md transform scale-[1.02] [&>svg]:text-white"
    : "text-text-dark hover:bg-bg-cream hover:text-primary [&>svg]:text-primary";

// ─── SubNavItem ──────────────────────────────────────────────────────────────
function SubNavItem({
  label,
  href,
  className,
  onClick,
}: SubItem & { className?: string; onClick?: () => void }) {
  return (
    <Link
      to={href}
      onClick={onClick}
      className={`w-full h-9 px-4 py-2 text-sm text-text-dark hover:bg-bg-cream hover:text-primary rounded-lg transition-colors ${className ?? ""}`}
    >
      {label}
    </Link>
  );
}

// ─── NavItem with dropdown ────────────────────────────────────────────────────
function NavItem({ item }: { item: NavItemData }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <Link
        to={item.href}
        className="flex items-center gap-1 px-3 py-2 text-sm text-text-dark hover:text-primary transition-colors"
      >
        <span>{item.label}</span>
        {item.subItems && (
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </Link>

      {/* Dropdown */}
      {item.subItems && open && (
        <div className="absolute right-0 pt-2 pb-2 z-50">
          <div className="w-48 bg-white border justify-center border-accent-light rounded-xl shadow-lg p-3 flex flex-col gap-1">
            {item.subItems.map((sub) => (
              <SubNavItem key={sub.href} label={sub.label} href={sub.href} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMenu({
  isOpen,
  onClose,
  user,
  onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-60 bg-black/50 transition-opacity duration-300 overflow-hidden ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        dir="rtl"
        className={`fixed left-0 top-0 z-70 h-full w-80 bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-bold text-text-dark">
              القائمة الرئيسية
            </h2>
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center size-8 rounded-md text-text-dark hover:bg-accent-light transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 py-4 border-b border-gray-200 bg-linear-to-br from-accent-light/30 to-primary/5">
            <div className="flex flex-col items-center text-center">
              {user ? (
                <>
                  <UserAvatar
                    name={user.name}
                    avatarUrl={user.profilePhotoUrl}
                    className="w-16 h-16 mb-3 rounded-2xl shadow-md"
                  />
                  <h3 className="text-base font-bold text-gray-900 mb-0.5">
                    مرحباً، {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2">{user.email}</p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 bg-linear-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mb-2 shadow-lg">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-base text-gray-900 mb-0.5">مرحباً بك</h3>
                  <p className="text-xs text-gray-500 mb-2">
                    قم بتسجيل الدخول للاستفادة من جميع المزايا
                  </p>
                </>
              )}
            </div>
          </div>

          <nav className="flex-1 py-3 px-4 overflow-y-auto overflow-x-hidden">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.href} className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className="flex flex-1 items-center gap-3 px-4 py-3 rounded-xl hover:bg-bg-cream transition-colors"
                    >
                      {item.icon}
                      <span className="text-base font-semibold text-text-dark">
                        {item.label}
                      </span>
                    </Link>

                    {item.subItems && (
                      <Button
                        onClick={() => toggleSection(item.label)}
                        variant="tertiary"
                        className="inline-flex size-9! text-primary transition-colors"
                        aria-label={`فتح ${item.label}`}
                        icon={
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              openSections[item.label] ? "rotate-180" : ""
                            }`}
                          />
                        }
                      />
                    )}
                  </div>

                  {item.subItems && openSections[item.label] && (
                    <ul className="my-2 mr-12 flex flex-col gap-3">
                      {item.subItems.map((sub) => (
                        <li key={sub.href}>
                          <Link
                            to={sub.href}
                            onClick={onClose}
                            className="block w-full py-1.5 text-right rounded-lg text-sm text-gray-600 hover:bg-accent-light/30 hover:text-primary transition-colors duration-150"
                          >
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}

              {iconActions.map((action) => {
                const isActive = location.pathname === action.href;
                return (
                  <li key={action.href}>
                    <Link
                      to={action.href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${navLinkVariant(isActive)}`}
                    >
                      {action.icon}
                      <span className="text-base font-medium">
                        {action.label}
                      </span>
                    </Link>
                  </li>
                );
              })}

              {user &&
                userActions.map((action) => {
                  const isActive = action.href === location.pathname;
                  return (
                    <li key={action.href}>
                      <Link
                        to={action.href}
                        onClick={onClose}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${navLinkVariant(isActive)}`}
                      >
                        <action.icon className="w-5 h-5 shrink-0" />
                        <span className="text-base font-medium">
                          {action.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </nav>

          <div className="border-t border-gray-200 px-4 py-3">
            {user ? (
              <Button
                variant="hero"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="gap-3 px-4 py-3 rounded-xl transition-all duration-200  text-red-500 hover:bg-red-50 "
                icon={<LogOut className="w-5 h-5 shrink-0" />}
                iconPos="right"
              >
                <span className="text-sm font-semibold leading-none">
                  تسجيل الخروج
                </span>
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/auth/login");
                }}
                variant="primary"
                className="w-full gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                icon={<LogIn className="w-5 h-5 shrink-0 text-white" />}
                iconPos="right"
              >
                <span className="text-sm leading-none">تسجيل الدخول</span>
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const isAuthenticated = !!token && !!user?.role;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50  shadow-sm bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-primary to-primary-light rounded-xl flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl text-primary">دكان</span>
          </Link>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center gap-4">
            {navItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 items-center justify-center max-w-2xl mx-auto">
            <div className="w-full">
              <div className="relative">
                <Input
                  type="text"
                  className="h-10!"
                  placeholder="ابحث عن منتج أو متجر..."
                  icon={<Search className="w-5 h-5 text-gray-400" />}
                />
              </div>
            </div>
          </div>

          {/* Icon actions + mobile menu toggle */}
          <div className="flex items-center gap-4">
            {iconActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="inline-flex items-center justify-center size-9 rounded-md hover:bg-accent-light transition-colors"
                aria-label={action.ariaLabel}
              >
                {action.icon}
              </Link>
            ))}

            <div className="hidden lg:flex items-center gap-4">
              {/* User Profile */}
              {isAuthenticated && user ? (
                <div className="relative group/user">
                  <Button
                    className="inline-flex items-center justify-center size-9!"
                    aria-haspopup="true"
                    aria-expanded="false"
                    variant="hero"
                  >
                    <UserAvatar
                      name={user.name}
                      avatarUrl={user.profilePhotoUrl}
                      className="w-7 h-7"
                    />
                  </Button>
                  {/* User Dropdown */}
                  <div className="absolute top-10 left-0 pt-2 opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible group-focus-within/user:opacity-100 group-focus-within/user:visible transition-all duration-200 z-50">
                    <div className="w-64 bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
                      <div className="p-2 flex flex-col items-center text-center bg-gray-50/50 border-b border-gray-100">
                        <UserAvatar
                          name={user.name}
                          avatarUrl={user.profilePhotoUrl}
                          className="w-10 h-10 shrink-0 shadow-sm"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="text-base font-semibold text-text-dark">
                            {user.name}
                          </span>
                          <span className="text-xs text-gray-500 ">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <div className="p-2 space-y-0.5">
                        {userActions.map((action) => {
                          const isActive = location.pathname === action.href;
                          return (
                            <Link
                              key={action.href}
                              to={action.href}
                              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 group ${navLinkVariant(isActive)}`}
                            >
                              <action.icon className="w-4 h-4 transition-colors" />
                              {action.label}
                            </Link>
                          );
                        })}
                      </div>
                      <div className="p-2 border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full text-start cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center size-9 rounded-md hover:bg-accent-light transition-colors"
                  aria-label="حسابي"
                >
                  <User className="w-5 h-5 text-text-dark" />
                </Link>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center justify-center size-9 rounded-md hover:bg-accent-light transition-colors lg:hidden"
              aria-label="فتح القائمة"
              aria-expanded={mobileMenuOpen}
            >
              <Menu className="w-6 h-6 text-text-dark" />
            </button>
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
}
