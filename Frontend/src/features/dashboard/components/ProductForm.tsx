import { Controller, useForm } from "react-hook-form";
import { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/TextArea";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ImageSlot } from "./ImageSlot";
import { CheckCircle } from "lucide-react";
import { IProduct, EProductStatus } from "@/types/entities/product.types";
import {
  productSchema,
  type ProductFormData,
} from "@/features/dashboard/schemas/product.schema";
import { useGetCategoriesQuery } from "@/api/category.api";
import { useOwnerStore } from "@/context/OwnerStoreContext";

interface ProductFormProps {
  initialData?: Partial<IProduct>;
  onSubmit: (formData: FormData) => void;
  isLoading?: boolean;
}

const DEFAULT_VALUES: ProductFormData = {
  title: "",
  price: 0,
  stockQuantity: 0,
  categoryId: "",
  status: EProductStatus.Active,
  description: "",
};


export const ProductForm = ({
  initialData,
  onSubmit,
  isLoading,
}: ProductFormProps) => {
  const navigate = useNavigate();
  const { currentStore } = useOwnerStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<(File | null)[]>(new Array(6).fill(null));

  const storeSlug = currentStore?.subdomain;
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useGetCategoriesQuery(
    { storeSlug: storeSlug ?? "" },
    { skip: !storeSlug },
  );
  const [previews, setPreviews] = useState<string[]>(new Array(6).fill(""));

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previews.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);

  const categoryOptions = useMemo(() => {
    const categories = categoriesResponse?.data || [];
    return [
      { value: "", label: "اختر القسم" },
      ...categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
      })),
    ];
  }, [categoriesResponse]);

  const handleUploadClick = (index: number) => {
    setActiveSlot(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || activeSlot === null) return;

    const incoming = Array.from(e.target.files).slice(0, 6 - activeSlot);

    setPreviews((prev) =>
      prev.map((url, i) => {
        const file = incoming[i - activeSlot];
        if (!file) return url;
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        return URL.createObjectURL(file);
      })
    );

    setSelectedFiles((prev) =>
      prev.map((existing, i) => incoming[i - activeSlot] ?? existing)
    );

    setActiveSlot(null);
    e.target.value = "";
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { ...DEFAULT_VALUES, ...initialData },
  });

  const onFormSubmit = (data: ProductFormData) => {
    const formData = new FormData();
    const formFields: Array<keyof ProductFormData> = [
      "title",
      "price",
      "stockQuantity",
      "categoryId",
      "description",
      "status",
    ];

    formFields.forEach((field) => {
      const value = data[field];
      if (value !== undefined && value !== null) {
        formData.append(field, String(value));
      }
    });
    // Backend currently accepts one image via upload.single("image").
    const firstImage = selectedFiles.find((file): file is File => file !== null);
    if (firstImage) {
      formData.append("image", firstImage);
    }

    onSubmit(formData);
  };

  const isPending = isLoading || isSubmitting;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-accent-light/50 overflow-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="bg-primary p-6 text-white flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          {initialData?.id ? "تعديل المنتج" : "إضافة منتج جديد"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="p-8 space-y-8">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        {/* Image Upload */}
        <div className="flex flex-col gap-4">
          <label className="text-sm font-semibold text-text-dark flex items-center gap-2">
            صور المنتج (الحد الأقصى: 6 صور)
            <span className="text-red-500 font-bold">*</span>
          </label>
          <div className="space-y-4">
            <ImageSlot
              index={0}
              isMain
              src={previews[0] || initialData?.images?.[0]?.imageUrl}
              onUpload={handleUploadClick}
            />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((index) => (
                <ImageSlot
                  key={index}
                  index={index}
                  src={previews[index] || initialData?.images?.[index]?.imageUrl}
                  onUpload={handleUploadClick}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-6">
          <Input
            label="اسم المنتج"
            required
            {...register("title")}
            placeholder="مثال: ساعة ذكية رياضية"
            className="border-accent-light"
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Input
                label="الكمية"
                required
                type="number"
                placeholder="50"
                step="1"
                min={0}
                max={1000}
                {...register("stockQuantity", { valueAsNumber: true })}
                className="border-accent-light text-right"
              />
              {errors.stockQuantity && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.stockQuantity.message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="السعر (ج.م)"
                required
                type="number"
                placeholder="250"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                className="border-accent-light text-right"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.price.message}
                </p>
              )}
            </div>
          </div>

          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                label="القسم"
                required
                {...field}
                value={field.value ?? ""}
                options={categoryOptions}
                className="border-accent-light"
                disabled={isLoadingCategories}
              />
            )}
          />
          {errors.categoryId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.categoryId.message}
            </p>
          )}

          <TextArea
            label="وصف المنتج"
            required
            {...register("description")}
            placeholder="اكتب وصفاً تفصيلياً للمنتج..."
            rows={4}
            className="border-accent-light"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-accent-light flex flex-col md:flex-row items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline-accent"
            className="w-full bg-white rounded-xl h-9!"
            onClick={() => navigate("/dashboard/products")}
            disabled={isPending}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-full rounded-xl flex items-center justify-center gap-2 h-9!"
            disabled={isPending}
          >
            {isPending
              ? "جاري الحفظ..."
              : initialData?.id
                ? "حفظ التغييرات"
                : "إضافة المنتج"}
            {!isPending && <CheckCircle className="w-5 h-5" />}
          </Button>
        </div>
      </form>
    </div>
  );
};
