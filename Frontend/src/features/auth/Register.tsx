import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthCard } from "@/components/auth/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Mail, Lock } from "lucide-react";

import {
  registerSchema,
  type RegisterFormValues,
} from "./schemas/register.schema";
import { useRegisterMutation } from "@/api/auth.api";
import { showNotification } from "@/utils/showNotification";
import { EUserRole } from "@/types/entities/user.types";

/* ────────────────────────────────────────────────────────
 * Constants
 * ──────────────────────────────────────────────────────── */

interface Role {
  roleName: RegisterFormValues["role"];
  icon: string;
  title: string;
  description: string;
}

const roles: readonly Role[] = [
  {
    roleName: EUserRole.Customer,
    icon: "🛍️",
    title: "أشتري منتجات",
    description: "تسوق من المتاجر",
  },
  {
    roleName: EUserRole.StoreOwner,
    icon: "🏪",
    title: "أبيع منتجات",
    description: "أنشئ متجراً",
  },
] as const;

/* ────────────────────────────────────────────────────────
 * Component
 * ──────────────────────────────────────────────────────── */

export const RegisterForm = (): React.JSX.Element => {
  const [registerApi] = useRegisterMutation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: EUserRole.Customer,
    },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const {confirmPassword, terms, ...payload} = data;
      const response = await registerApi(payload).unwrap();

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.user.role);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      showNotification({ message: "تم تسجيل الحساب بنجاح", variant: "success" });
      response.data.user.role === EUserRole.Customer ? navigate("/") : navigate("/dashboard");
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || "حدث خطأ غير متوقع";
      showNotification({ message: errorMessage, variant: "error" });
    }
  };

  return (
    <AuthCard title="إنشاء حساب جديد" subtitle="انضم إلى سوقنا اليوم">
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-text-dark mb-3">
            أريد أن:
          </label>
          <div className="grid grid-cols-2 gap-4">
            {roles.map((r) => (
              <div
                key={r.roleName}
                onClick={() => setValue("role", r.roleName)}
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all text-center ${
                  selectedRole === r.roleName
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-accent-light hover:border-accent"
                }`}
              >
                <div className="text-3xl mb-2">{r.icon}</div>
                <div className="text-text-dark font-medium">{r.title}</div>
                <div className="text-xs text-text-muted mt-1">
                  {r.description}
                </div>
              </div>
            ))}
          </div>
          <input type="hidden" {...register("role")} />
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <Input
              label="الاسم الكامل"
              id="name"
              type="text"
              placeholder="أدخل اسمك الكامل"
              icon={<User className="w-5 h-5" />}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Input
              label="البريد الإلكتروني"
              id="email"
              type="email"
              placeholder="البريد@الإلكتروني.com"
              icon={<Mail className="w-5 h-5" />}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <Input
              label="كلمة المرور"
              id="password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-xs text-red-500 mt-1">
                {errors.password.message}
              </p>
            ) : (
              <p className="text-xs text-text-muted mt-1">6 أحرف على الأقل</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Input
              label="تأكيد كلمة المرور"
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            className="mt-1 rounded border-accent-light accent-primary"
            {...register("terms")}
          />
          <div>
            <label htmlFor="terms" className="text-sm text-text-muted">
              أوافق على{" "}
              <Link to="/terms" className="text-primary hover:underline">
                الشروط والأحكام
              </Link>{" "}
              و{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                سياسة الخصوصية
              </Link>
            </label>
            {errors.terms && (
              <p className="text-xs text-red-500 mt-1">
                {errors.terms.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          className="py-6 rounded-xl h-9! text-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جارٍ الإنشاء..." : "إنشاء الحساب"}
        </Button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-text-muted">
          لديك حساب بالفعل؟{" "}
          <Link
            to="/auth/login"
            className="text-primary hover:text-primary-dark hover:underline"
          >
            سجّل دخولك
          </Link>
        </p>
      </div>
    </AuthCard>
  );
};
