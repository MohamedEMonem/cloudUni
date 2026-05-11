import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircleUser,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  LogOut,
  Trash2,
  KeyRound,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  useDeleteAccountMutation,
  useGetProfileQuery,
  useLogoutMutation,
  usePatchProfileMutation,
  useResendOtpMutation,
  useVerifyOtpMutation,
} from "@/api/auth.api";
import { showNotification } from "@/utils/showNotification";

export default function Profile() {
  const navigate = useNavigate();

  const { data: profileResponse, isLoading, isError, refetch } = useGetProfileQuery();
  const [patchProfile, { isLoading: isSaving }] = usePatchProfileMutation();
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [verifyOtp, { isLoading: isVerifyingOtp }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendingOtp }] = useResendOtpMutation();

  const profile = profileResponse?.data;

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!profile) return;

    setName(profile.name || "");
    setContactNumber(profile.contactNumber || "");
    setProfilePhotoUrl(profile.profilePhotoUrl || "");
  }, [profile]);

  const roleLabel = useMemo(() => {
    const role = profile?.role;
    if (role === "StoreOwner") return "بائع";
    if (role === "Admin") return "أدمن";
    return "عميل";
  }, [profile?.role]);

  const createdAt = useMemo(() => {
    if (!profile?.createdAt) return "غير متوفر";
    return new Date(profile.createdAt).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [profile?.createdAt]);

  const handleSave = async () => {
    try {
      const response = await patchProfile({
        name: name.trim() || undefined,
        contactNumber: contactNumber.trim() || null,
        profilePhotoUrl: profilePhotoUrl.trim() || null,
      }).unwrap();

      localStorage.setItem("user", JSON.stringify(response.data));
      setIsEditing(false);
      showNotification({ message: "تم تحديث الملف الشخصي بنجاح", variant: "success" });
      void refetch();
    } catch (error: any) {
      showNotification({
        message: error?.data?.message || "تعذر تحديث الملف الشخصي",
        variant: "error",
      });
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      showNotification({ message: "أدخل رمز OTP أولاً", variant: "error" });
      return;
    }

    try {
      await verifyOtp({ otp: otp.trim() }).unwrap();
      setOtp("");
      showNotification({ message: "تم التحقق من البريد بنجاح", variant: "success" });
      void refetch();
    } catch (error: any) {
      showNotification({
        message: error?.data?.message || "رمز OTP غير صحيح أو منتهي",
        variant: "error",
      });
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp().unwrap();
      showNotification({ message: "تم إرسال OTP جديد إلى بريدك", variant: "success" });
    } catch (error: any) {
      showNotification({
        message: error?.data?.message || "تعذر إعادة إرسال OTP",
        variant: "error",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Ignore API logout failure and always clear local auth.
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("ownerStoreSlug");
      localStorage.removeItem("activeStoreSlug");
      navigate("/auth/login");
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("هل أنت متأكد من حذف الحساب؟ لا يمكن التراجع.");
    if (!confirmed) return;

    try {
      await deleteAccount().unwrap();
      showNotification({ message: "تم حذف الحساب", variant: "success" });
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      localStorage.removeItem("ownerStoreSlug");
      localStorage.removeItem("activeStoreSlug");
      navigate("/");
    } catch (error: any) {
      showNotification({
        message: error?.data?.message || "تعذر حذف الحساب",
        variant: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
        جاري تحميل الملف الشخصي...
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 max-w-xl text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-3">تعذر تحميل الملف الشخصي</h1>
          <Button variant="outline-accent" className="h-9!" onClick={() => void refetch()}>
            <RefreshCcw className="w-4 h-4" />
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-accent-light/50 shadow-sm p-6">
          <div className="text-center space-y-3">
            <div className="mx-auto w-28 h-28 rounded-full overflow-hidden border-2 border-accent-light">
              <UserAvatar
                name={profile.name}
                avatarUrl={profile.profilePhotoUrl}
                className="w-full h-full rounded-none"
              />
            </div>
            <h2 className="text-xl font-bold text-text-dark">{profile.name}</h2>
            <p className="text-text-muted text-sm">{profile.email}</p>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
              <ShieldCheck className="w-4 h-4" />
              {roleLabel}
            </span>
            <div className="text-sm text-text-muted flex items-center justify-center gap-2 pt-2">
              <Calendar className="w-4 h-4" />
              {createdAt}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-accent-light/50 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-dark">المعلومات الشخصية</h3>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline-accent"
                    className="h-9! w-auto! px-4"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    إلغاء
                  </Button>
                  <Button
                    variant="primary"
                    className="h-9! w-auto! px-4"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  className="h-9! w-auto! px-4"
                  onClick={() => setIsEditing(true)}
                >
                  تعديل
                </Button>
              )}
            </div>

            <Input
              label="الاسم"
              icon={<CircleUser className="w-4 h-4" />}
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={!isEditing}
            />
            <Input
              label="البريد الإلكتروني"
              icon={<Mail className="w-4 h-4" />}
              value={profile.email}
              disabled
            />
            <Input
              label="رقم الهاتف"
              icon={<Phone className="w-4 h-4" />}
              value={contactNumber}
              onChange={(event) => setContactNumber(event.target.value)}
              disabled={!isEditing}
            />
            <Input
              label="رابط الصورة الشخصية"
              value={profilePhotoUrl}
              onChange={(event) => setProfilePhotoUrl(event.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="bg-white rounded-2xl border border-accent-light/50 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-text-dark">التحقق بالبريد (OTP)</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                label="رمز OTP"
                icon={<KeyRound className="w-4 h-4" />}
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="أدخل الرمز المكون من 6 أرقام"
              />
              <div className="flex items-end gap-2">
                <Button
                  variant="primary"
                  className="h-12! w-auto! px-4"
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp}
                >
                  {isVerifyingOtp ? "جاري التحقق..." : "تحقق"}
                </Button>
                <Button
                  variant="outline-accent"
                  className="h-12! w-auto! px-4"
                  onClick={handleResendOtp}
                  disabled={isResendingOtp}
                >
                  {isResendingOtp ? "جاري الإرسال..." : "إعادة إرسال"}
                </Button>
              </div>
            </div>
            <p className="text-sm text-text-muted">
              حالة التحقق الحالية: {profile.isVerified ? "موثّق" : "غير موثّق"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-6">
            <h3 className="text-lg font-bold text-red-600 mb-4">إجراءات الحساب</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline-accent"
                className="h-10! w-auto! px-4"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4" />
                {isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}
              </Button>
              <Button
                variant="secondary"
                className="h-10! w-auto! px-4 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "جاري الحذف..." : "حذف الحساب"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
