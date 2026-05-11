import { updatestoreSchema, type CreateStoreDto, type updateStoreDto } from "../DTO/store.dto.js";
import prisma from "../config/db.js";

export class StoreServices {
    
    async createStore(dto: CreateStoreDto, ownerId: string) {
        // 1. Check for existing subdomain
        const existingSubdomain = await prisma.store.findUnique({
            where: { subdomain: dto.subdomain },
        });

        if (existingSubdomain) {
            const error = new Error("Subdomain already exists") as Error & {
                statusCode?: number;
            };
            error.statusCode = 409;
            throw error;
        }

        // 2. Check for existing store name
        const existingStoreName = await prisma.store.findUnique({
            where: { 
                name: dto.name },
        });

        if (existingStoreName) {
            const error = new Error("Store name already exists") as Error & {
                statusCode?: number;
            };
            error.statusCode = 409;
            throw error;
        }

     
        const [store, storeowner] = await prisma.$transaction([
         prisma.store.create({
            data: {
                ...dto,
                status: 'Active',
                owner: {
                    connect: { id: ownerId }
                }
            },
        }),
         prisma.user.update({
            where:{id:ownerId},
            data: {
                role: 'StoreOwner',

            }
        })

    ]);

        return {store, storeowner};
    }
    async getUserwithStores(userId: string) {
        const userWithStores = await prisma.user.findUnique({
            where: {id : userId},
            include:{
                ownedStores:{
                    where: {
                        deletedAt: null 
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })
        return userWithStores;
    }

    // updateStore
    async updateStore(userId: string, storesubdomain: string, datatoupdate: updateStoreDto) {
        const owner = await this.getUserwithStores(userId);

        if (!owner) {
            const error = new Error("User not found") as Error & { statusCode?: number };
            error.statusCode = 404;
            throw error;
        }

        const storeSubdomain = storesubdomain.trim();
        const store = owner.ownedStores.find((s) => s.subdomain === storeSubdomain);

        if (!store) {
            const error = new Error("Store not found") as Error & { statusCode?: number };
            error.statusCode = 404;
            throw error;
        }

        const validation = updatestoreSchema.safeParse({ data: datatoupdate });
        if (!validation.success) {
            const error = new Error("Validation failed") as Error & { statusCode?: number; details?: unknown };
            error.statusCode = 400;
            error.details = validation.error.format();
            throw error;
        }

        const dataToUpdate = validation.data.data;

        if (Object.keys(dataToUpdate).length === 0) {
            const error = new Error("No valid fields provided for update") as Error & { statusCode?: number };
            error.statusCode = 400;
            throw error;
        }

        if (dataToUpdate.subdomain !== undefined && dataToUpdate.subdomain !== store.subdomain) {
            const existingSubdomain = await prisma.store.findUnique({
                where: { subdomain: dataToUpdate.subdomain },
                select: { id: true },
            });

            if (existingSubdomain && existingSubdomain.id !== store.id) {
                const error = new Error("Subdomain already exists") as Error & { statusCode?: number };
                error.statusCode = 409;
                throw error;
            }
        }

        if (dataToUpdate.name !== undefined && dataToUpdate.name !== store.name) {
            const existingStoreName = await prisma.store.findUnique({
                where: { name: dataToUpdate.name },
                select: { id: true },
            });

            if (existingStoreName && existingStoreName.id !== store.id) {
                const error = new Error("Store name already exists") as Error & { statusCode?: number };
                error.statusCode = 409;
                throw error;
            }
        }

        const data: {
            name?: string;
            subdomain?: string;
            description?: string | null;
            coverBannerUrl?: string | null;
            businessAddress?: string | null;
            vatNumber?: string | null;
            themeSettings?: any;
        } = {};

        if (dataToUpdate.name !== undefined) data.name = dataToUpdate.name;
        if (dataToUpdate.subdomain !== undefined) data.subdomain = dataToUpdate.subdomain;
        if (dataToUpdate.description !== undefined) data.description = dataToUpdate.description ?? null;
        if (dataToUpdate.coverBannerUrl !== undefined) data.coverBannerUrl = dataToUpdate.coverBannerUrl ?? null;
        if (dataToUpdate.businessAddress !== undefined) data.businessAddress = dataToUpdate.businessAddress ?? null;
        if (dataToUpdate.vatNumber !== undefined) data.vatNumber = dataToUpdate.vatNumber ?? null;
        if (dataToUpdate.themeSettings !== undefined) data.themeSettings = dataToUpdate.themeSettings;

        const updatedStore = await prisma.store.update({
            where: { id: store.id },
            data,
        });

        return updatedStore;
    }


    // async getStore()
}