import {Request, Response, NextFunction} from "express";
import {StoreServices} from "../services/StoreServices.js"
import {sendSuccess,sendError} from "../utils/response.js"
import { CreateStoreDto } from "../DTO/store.dto.js";
import { error } from "console";


const storeService = new StoreServices()

export const createStore = async (req: any, res: Response)=>{
try{
    const dto: CreateStoreDto = req.body.data;
    const currentUserId = (req as Request & { user?: { id: string } }).user?.id;

    if (!currentUserId) {
        return sendError(res, "Unauthorized", 401);
    }

    const newStore = await storeService.createStore(dto, currentUserId);


    return sendSuccess(res, { newStore }, "Store created successfully", 201);
}catch(error){
    const cause = error as Error & { statusCode?: number };
    const err: any = new Error(cause.message || "Failed to create store");
    err.status = cause.statusCode || 500;
    return next(err);
}
}
export const getStore = async (req: Request, res: Response)=>{
try {
    const currentUserId = req.user?.id
    if (!currentUserId){
        return sendError(res,"Unauthorized",401)
    }
    const userWithStores = await storeService.getUserwithStores(currentUserId);
    const userStoreCount = userWithStores?.ownedStores.length

    return sendSuccess(res,{numberOfStores:userStoreCount,userAndStores:userWithStores},"retrived successfully",200)
} catch (error) {
    
}

}

export const updateUser = async (req: Request, res:Response)=>{

    const update_data= {...req.body}
    


}
