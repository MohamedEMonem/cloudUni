import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Store, Sparkles } from "lucide-react";
import { useCreateStoreMutation } from "@/api/store.api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { showNotification } from "@/utils/showNotification";
import { useOwnerStore } from "@/context/OwnerStoreContext";
import { EUserRole } from "@/types/entities/user.types";

const normalizeSubdomain = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export function StoreSetup() {
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [description, setDescription] = useState("");
  const [isDirtySubdomain, setIsDirtySubdomain] = useState(false);
  const [isSuccessLocked, setIsSuccessLocked] = useState(false);

  const [createStore, { isLoading }] = useCreateStoreMutation();
  const { refetchStores, setSelectedStoreSlug } = useOwnerStore();

  const suggestedSubdomain = useMemo(() => {
    if (isDirtySubdomain) return subdomain;
    return normalizeSubdomain(name);
  }, [isDirtySubdomain, name, subdomain]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedSubdomain = normalizeSubdomain(suggestedSubdomain);

    if (!normalizedName || !normalizedSubdomain) {
      showNotification({
        message: "يرجى إدخال اسم المتجر والدومين الفرعي بشكل صحيح.",
        variant: "error",
      });
      return;
    }

    try {
      const response = await createStore({
        data: {
          name: normalizedName,
          subdomain: normalizedSubdomain,
          description: description.trim() || undefined,
        },
      }).unwrap();

      const createdRole = response?.data?.newStore?.storeowner?.role;
      if (createdRole) {
        localStorage.setItem("role", createdRole);
      } else {
        localStorage.setItem("role", EUserRole.StoreOwner);
      }

      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        try {
          const parsedUser = JSON.parse(rawUser);
          parsedUser.role = EUserRole.StoreOwner;
          localStorage.setItem("user", JSON.stringify(parsedUser));
        } catch {
          // ignore malformed local user cache
        }
      }

      await refetchStores();
      setSelectedStoreSlug(normalizedSubdomain);
      setIsSuccessLocked(true);

      showNotification({
        message: "تم إنشاء المتجر بنجاح. يمكنك الآن إضافة منتجاتك.",
        variant: "success",
      });
    } catch (error: any) {
      const statusCode = error?.status || error?.originalStatus || error?.data?.code;
      const isConflict = statusCode === 409;

      const apiMessage =
        error?.data?.message ||
        error?.data?.error ||
        error?.error ||
        error?.message;

      const errorMessage = isConflict
        ? "هذا الدومين الفرعي مستخدم بالفعل. جرّب اسماً آخر."
        : apiMessage || "تعذر إنشاء المتجر. حاول مرة أخرى.";

      showNotification({
        message: errorMessage,
        variant: "error",
      });

      if (isConflict) {
        setIsDirtySubdomain(true);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-accent-light/50 shadow-sm overflow-hidden">
      <div className="bg-primary text-white p-6">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Store className="w-5 h-5" />
          إعداد المتجر
        </h1>
        <p className="text-white/90 text-sm mt-2">
          أنشئ متجرك الآن لبدء إدارة المنتجات وتجربة لوحة التاجر كاملة.
        </p>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-5" dir="rtl">
        <Input
          label="اسم المتجر"
          required
          placeholder="مثال: Dokkan Store"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <Input
          label="الدومين الفرعي"
          required
          placeholder="my-store"
          value={suggestedSubdomain}
          onChange={(event) => {
            setIsDirtySubdomain(true);
            setSubdomain(event.target.value);
          }}
        />
        <p className="text-xs text-text-muted -mt-2">
          سيُستخدم في روابط المنتجات: /api/stores/{'{subdomain}'}/...
        </p>

        <TextArea
          label="وصف المتجر (اختياري)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          placeholder="نبذة مختصرة عن نشاط المتجر"
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full h-10!"
          disabled={isLoading || isSuccessLocked}
          icon={!isLoading ? <Sparkles className="w-4 h-4" /> : undefined}
        >
          {isLoading
            ? "جاري إنشاء المتجر..."
            : isSuccessLocked
              ? "تم إنشاء المتجر"
              : "إنشاء المتجر والمتابعة"}
        </Button>
      </form>
    </div>
  );
}
