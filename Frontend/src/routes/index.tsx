import { Routes, Route, Navigate } from "react-router-dom";
import HomeLayout from "@/layout/HomeLayout";
import AuthLayout from "@/layout/AuthLayout";
import DashboardLayout from "@/layout/DashboardLayout";

import ProtectedRoutes from "./ProtectedRoutes";
import ErrorPage from "@/pages/ErrorPage";

import { LoginForm } from "@/features/auth/Login";
import { RegisterForm } from "@/features/auth/Register";
import Profile from "@/pages/Profile";
import CartPage from "@/pages/CartPage";
import ProductDetailsPage from "@/pages/ProductDetailsPage";

import { ViewProducts } from "@/features/products/ViewProducts";

import { Overview } from "@/features/dashboard/Overview";
import { Products } from "@/features/dashboard/Products";
import { CreateProduct } from "@/features/dashboard/CreateProduct";
import { UpdateProduct } from "@/features/dashboard/UpdateProduct";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomeLayout />}>
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ViewProducts />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
      </Route>

      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<LoginForm />} />
        <Route path="register" element={<RegisterForm />} />
      </Route>

      {/* Protected */}
      <Route element={<ProtectedRoutes />}>
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="products" element={<Products />} />
          <Route path="products/create" element={<CreateProduct />} />
          <Route path="products/:id/edit" element={<UpdateProduct />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
