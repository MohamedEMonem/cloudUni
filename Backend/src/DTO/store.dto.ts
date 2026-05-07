// @ts-ignore - zod type resolution may fail in this environment while runtime import remains valid
import { z } from "zod";

export const createStoreSchema = z.object({
  data: z.object({
    name: z.string(),
    subdomain: z.string()
      .min(3, 'Subdomain must be at least 3 characters')
      .max(63, 'Subdomain cannot exceed 63 characters')
      .regex(/^[a-z0-9-]+$/, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
      .refine((val: string) => !['admin', 'api', 'www', 'support', 'dokkan'].includes(val), {
        message: 'This subdomain is a reserved keyword and cannot be used',
      }),
    description: z.string().optional(),
    coverBannerUrl: z.string().optional(),
    businessAddress: z.string().optional(),
    vatNumber: z.string().optional(),
    themeSettings: z.any().optional(),
  }),
});

export const updatestoreSchema = z.object({
  data: createStoreSchema.shape.data.partial(),
});
export type updateStoreDto = z.infer<typeof updatestoreSchema>["data"];
export type CreateStoreDto = z.infer<typeof createStoreSchema>["data"];