import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "@/features/products/components/ProductCard";
import FilterAsideBar from "@/features/products/components/FilterAsideBar";
import { Select } from "@/components/ui/Select";
import { useGetProductsQuery } from "@/api/product.api";
import { Button } from "@/components/ui/Button";
import { sortBy } from "@/utils/sorting";
import { SlidersHorizontal } from "lucide-react";

const sortConfigs: Record<
  string,
  { key: string; order: "asc" | "desc"; type?: "number" | "date" }
> = {
  newest: { key: "createdAt", order: "desc", type: "date" },
  price_low_high: { key: "price", order: "asc", type: "number" },
  price_high_low: { key: "price", order: "desc", type: "number" },
  highest_rated: { key: "rating", order: "desc", type: "number" },
};

export const ViewProducts = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("cat");
  const queryStoreSlug = searchParams.get("store");
  const fallbackStoreSlug = localStorage.getItem("ownerStoreSlug");
  const activeStoreSlug = queryStoreSlug || fallbackStoreSlug || "";

  const { data, isLoading, error } = useGetProductsQuery(
    { storeSlug: activeStoreSlug },
    { skip: !activeStoreSlug },
  );

  const products = data?.data ?? [];

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    city: "all",
    rating: "all",
    shipping: false,
  });

  const [sortedBy, setSortedBy] = useState("newest");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    console.log("Current Filters:", filters);
    console.log("Sorted By:", sortedBy);
  }, [filters, sortedBy]);

  useEffect(() => {
    if (categoryParam) {
      setFilters((prev) => ({ ...prev, category: categoryParam }));
    } else {
      setFilters((prev) => ({ ...prev, category: "all" }));
    }
  }, [categoryParam]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        filters.search.trim() === "" ||
        product.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory =
        filters.category === "all" || product.categoryId === filters.category;

      // Add more filters here as needed (city, rating, etc.)
      return matchesSearch && matchesCategory;
    });
  }, [products, filters]);

  const applySorting = (products: any[], sortedBy: string) => {
    const config = sortConfigs[sortedBy];
    if (!config) return products;

    return [...products].sort(
      sortBy(config.key as any, config.order, config.type),
    );
  };

  const displayedProducts = useMemo(() => {
    return applySorting(filteredProducts, sortedBy);
  }, [filteredProducts, sortedBy]);

  const reset = () => {
    setFilters({
      search: "",
      category: "all",
      city: "all",
      rating: "all",
      shipping: false,
    });
    setSortedBy("newest");
  };

  return (
    <div className=" bg-gray-50 py-8" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl">كل المنتجات</h1>
          <p className="text-gray-600">
            تم العثور على {filteredProducts.length} منتج
          </p>
        </div>
        <div className="flex gap-8 relative">
          <FilterAsideBar
            filters={filters}
            setFilters={setFilters}
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
          />
          <div className="flex-1 w-full lg:w-auto">
            {/* Bar */}
            <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between mb-8 gap-4">
              {/* Filter Button (Mobile Only) */}
              <div className="flex items-center lg:hidden">
                <Button
                  variant="outline-accent"
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="h-9! items-center gap-2 px-4 py-2.5 border! text-gray-700!"
                  icon={<SlidersHorizontal size={18} className="text-gray-500" />}
                  iconPos="right"
                >
                  <span className="text-sm font-medium">الفلاتر</span>
                </Button>
              </div>

              {/* Sort Section */}
              <div className="flex items-center gap-3 shrink-0">
                <Select
                  value={sortedBy}
                  onChange={(val) => setSortedBy(val.target.value)}
                  options={[
                    { value: "newest", label: "الأحدث" },
                    {
                      value: "price_low_high",
                      label: "السعر: من الأقل",
                    },
                    {
                      value: "price_high_low",
                      label: "السعر: من الأعلى",
                    },
                    { value: "highest_rated", label: "الأعلى تقييماً" },
                  ]}
                  className="h-9! px-4! lg:h-12! lg:px-12!"
                />
              </div>
            </div>

            {/* Products Grid */}
              {!activeStoreSlug ? (
                <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                  <p className="text-gray-600">اختر متجر أولاً لعرض منتجاته عبر الرابط ?store=store-slug</p>
                </div>
              ) : isLoading ? (
              <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                <p className="text-gray-600">جاري تحميل المنتجات...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                <p className="text-red-600">حدث خطأ أثناء تحميل المنتجات.</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center shadow-sm flex flex-col items-center">
                <p className="text-gray-600 mb-4">
                  لم يتم العثور على منتجات تطابق معاييرك.
                </p>
                <Button
                  variant="outline-accent"
                  onClick={() => reset()}
                  data-slot="button"
                  className="w-fit! h-9! lg:h-12! px-4 py-2 lg:px-6 rounded-lg text-black! border! outline-none! text-sm! lg:text-base! hover:text-white!"
                >
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayedProducts &&
                  displayedProducts.map(
                    (p) => p && <ProductCard key={p.id} product={p} storeSlug={activeStoreSlug} />,
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
