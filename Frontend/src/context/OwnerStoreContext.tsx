import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useGetOwnerStoresQuery } from "@/api/store.api";
import { EUserRole } from "@/types/entities/user.types";
import type { IStore } from "@/types/entities/store.types";

interface IOwnerStoreContext {
  stores: IStore[];
  currentStore: IStore | null;
  selectedStoreSlug: string | null;
  setSelectedStoreSlug: (slug: string) => void;
  hasStore: boolean;
  isOwnerRole: boolean;
  isStoreLoading: boolean;
  isStoreError: boolean;
  refetchStores: () => void;
}

const OwnerStoreContext = createContext<IOwnerStoreContext | null>(null);

const OWNER_STORE_KEY = "ownerStoreSlug";

export function OwnerStoreProvider({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isOwnerRole = role === EUserRole.StoreOwner || role === EUserRole.Admin;
  const shouldFetchStores = Boolean(token);

  const {
    data: storesResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetOwnerStoresQuery(undefined, {
    skip: !shouldFetchStores,
  });

  const stores = storesResponse?.data?.userAndStores?.ownedStores ?? [];
  const hasStore = stores.length > 0;

  const [selectedStoreSlug, setSelectedStoreSlugState] = useState<string | null>(null);

  useEffect(() => {
    if (!hasStore) {
      setSelectedStoreSlugState(null);
      localStorage.removeItem(OWNER_STORE_KEY);
      return;
    }

    const persistedStoreSlug = localStorage.getItem(OWNER_STORE_KEY);
    const persistedStoreExists =
      persistedStoreSlug !== null && stores.some((store) => store.subdomain === persistedStoreSlug);

    const nextStoreSlug = persistedStoreExists ? persistedStoreSlug : stores[0].subdomain;

    setSelectedStoreSlugState(nextStoreSlug);
    localStorage.setItem(OWNER_STORE_KEY, nextStoreSlug);
  }, [hasStore, stores]);

  const currentStore = useMemo(() => {
    if (!hasStore) return null;

    if (!selectedStoreSlug) {
      return stores[0] ?? null;
    }

    return stores.find((store) => store.subdomain === selectedStoreSlug) ?? stores[0] ?? null;
  }, [hasStore, selectedStoreSlug, stores]);

  const setSelectedStoreSlug = (slug: string) => {
    const selectedStoreExists = stores.some((store) => store.subdomain === slug);
    if (!selectedStoreExists) return;

    setSelectedStoreSlugState(slug);
    localStorage.setItem(OWNER_STORE_KEY, slug);
  };

  const contextValue: IOwnerStoreContext = {
    stores,
    currentStore,
    selectedStoreSlug,
    setSelectedStoreSlug,
    hasStore,
    isOwnerRole: isOwnerRole || hasStore,
    isStoreLoading: shouldFetchStores && (isLoading || isFetching),
    isStoreError: isError,
    refetchStores: () => {
      void refetch();
    },
  };

  return <OwnerStoreContext.Provider value={contextValue}>{children}</OwnerStoreContext.Provider>;
}

export function useOwnerStore() {
  const context = useContext(OwnerStoreContext);

  if (!context) {
    throw new Error("useOwnerStore must be used within OwnerStoreProvider");
  }

  return context;
}
