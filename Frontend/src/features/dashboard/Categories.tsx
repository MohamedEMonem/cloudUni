import { useMemo, useState } from "react";
import { FolderTree, Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { DashboardCard } from "@/components/ui/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/api/category.api";
import { useOwnerStore } from "@/context/OwnerStoreContext";
import { showNotification } from "@/utils/showNotification";

type CategoryDraft = {
  name: string;
  parentCategoryId: string;
};

export function Categories() {
  const { currentStore } = useOwnerStore();
  const storeSlug = currentStore?.subdomain;

  const { data, isLoading } = useGetCategoriesQuery(
    { storeSlug: storeSlug ?? "" },
    { skip: !storeSlug },
  );

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const categories = data?.data ?? [];
  const [draft, setDraft] = useState<CategoryDraft>({ name: "", parentCategoryId: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const parentOptions = useMemo(
    () => [
      { value: "", label: "بدون قسم رئيسي" },
      ...categories.map((category) => ({ value: category.id, label: category.name })),
    ],
    [categories],
  );

  const handleCreate = async () => {
    if (!storeSlug) return;
    if (!draft.name.trim()) {
      showNotification({ message: "اسم القسم مطلوب", variant: "error" });
      return;
    }

    try {
      await createCategory({
        storeSlug,
        data: {
          name: draft.name.trim(),
          parentCategoryId: draft.parentCategoryId || null,
        },
      }).unwrap();

      showNotification({ message: "تم إنشاء القسم بنجاح", variant: "success" });
      setDraft({ name: "", parentCategoryId: "" });
    } catch (error: any) {
      showNotification({
        message: error?.data?.message || "تعذر إنشاء القسم",
        variant: "error",
      });
    }
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (id: string) => {
    if (!storeSlug) return;
    if (!editingName.trim()) {
      showNotification({ message: "اسم القسم مطلوب", variant: "error" });
      return;
    }

    try {
      await updateCategory({ id, storeSlug, data: { name: editingName.trim() } }).unwrap();
      showNotification({ message: "تم تحديث القسم", variant: "success" });
      cancelEdit();
    } catch (error: any) {
      showNotification({
        message: error?.data?.message || "تعذر تحديث القسم",
        variant: "error",
      });
    }
  };

  const removeCategory = async (id: string) => {
    if (!storeSlug) return;

    try {
      await deleteCategory({ id, storeSlug }).unwrap();
      showNotification({ message: "تم حذف القسم", variant: "success" });
    } catch (error: any) {
      showNotification({
        message: error?.data?.message || "تعذر حذف القسم",
        variant: "error",
      });
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500" dir="rtl">
      {!storeSlug && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-700 text-sm">
          يرجى اختيار متجر صالح أولاً حتى تتمكن من إدارة الأقسام.
        </div>
      )}

      <DashboardCard title="إدارة الأقسام" icon={<FolderTree className="w-6 h-6 text-primary" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <Input
            label="اسم القسم الجديد"
            value={draft.name}
            onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="مثال: إلكترونيات"
          />

          <Select
            label="القسم الرئيسي"
            options={parentOptions}
            value={draft.parentCategoryId}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, parentCategoryId: event.target.value }))
            }
          />

          <div className="flex items-end">
            <Button
              variant="primary"
              className="h-12!"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleCreate}
              disabled={!storeSlug || isCreating}
            >
              {isCreating ? "جاري الإضافة..." : "إضافة قسم"}
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-accent-light/40 overflow-hidden">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="border-b border-accent-light/50 bg-bg-cream/50 text-text-muted">
                <th className="p-3">اسم القسم</th>
                <th className="p-3">القسم الرئيسي</th>
                <th className="p-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-text-muted">
                    جاري تحميل الأقسام...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-text-muted">
                    لا توجد أقسام حالياً.
                  </td>
                </tr>
              ) : (
                categories.map((category) => {
                  const parentName =
                    categories.find((item) => item.id === category.parentCategoryId)?.name || "-";

                  const isEditing = editingId === category.id;

                  return (
                    <tr key={category.id} className="border-b border-accent-light/20">
                      <td className="p-3">
                        {isEditing ? (
                          <Input
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                          />
                        ) : (
                          <span className="font-medium text-text-dark">{category.name}</span>
                        )}
                      </td>
                      <td className="p-3 text-text-muted">{parentName}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          {isEditing ? (
                            <>
                              <Button
                                variant="tertiary"
                                className="size-9! p-0"
                                icon={<Save className="w-4 h-4 text-green-600" />}
                                onClick={() => saveEdit(category.id)}
                                disabled={isUpdating}
                              />
                              <Button
                                variant="tertiary"
                                className="size-9! p-0"
                                icon={<X className="w-4 h-4 text-text-muted" />}
                                onClick={cancelEdit}
                                disabled={isUpdating}
                              />
                            </>
                          ) : (
                            <>
                              <Button
                                variant="tertiary"
                                className="size-9! p-0"
                                icon={<Pencil className="w-4 h-4" />}
                                onClick={() => startEdit(category.id, category.name)}
                              />
                              <Button
                                variant="tertiary"
                                className="size-9! p-0 text-red-500 hover:bg-red-50"
                                icon={<Trash2 className="w-4 h-4" />}
                                onClick={() => removeCategory(category.id)}
                                disabled={isDeleting}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>
    </div>
  );
}