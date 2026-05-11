import express from "express";
import { auth, authStoreOwner } from "../middleware/auth.js";
import * as CategoryController from "../controllers/CategoryController.js";

const router = express.Router({ mergeParams: true });

router.get("/", 
  /* #swagger.tags = ['Categories']
     #swagger.summary = 'List all categories'
  */
  CategoryController.listCategories
);

router.get("/:id", 
  /* #swagger.tags = ['Categories']
     #swagger.summary = 'Get category by ID'
  */
  CategoryController.getCategoryById
);

router.use(auth);
router.use(authStoreOwner);

router.post("/", 
  /* #swagger.tags = ['Categories']
     #swagger.summary = 'Create a category (Admin only)'
     #swagger.security = [{ "bearerAuth": [] }] 
  */
  CategoryController.createCategory
);

router.patch("/:id", 
  /* #swagger.tags = ['Categories']
     #swagger.summary = 'Update a category (Admin only)'
     #swagger.security = [{ "bearerAuth": [] }] 
  */
  CategoryController.updateCategory
);

router.delete("/:id", 
  /* #swagger.tags = ['Categories']
     #swagger.summary = 'Delete a category (Admin only)'
     #swagger.security = [{ "bearerAuth": [] }] 
  */
  CategoryController.deleteCategory
);

export default router;