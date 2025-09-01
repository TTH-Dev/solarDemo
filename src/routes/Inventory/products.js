import express from 'express';
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProductById,
    deleteProductById,
    
} from "../../controllers/Inventory/products.js";

import { protect } from "../../controllers/Admin/admin.js";



const productRouter = express.Router();

productRouter.use(protect);

productRouter.route("/").get(getAllProducts).post(createProduct);

productRouter.route("/:id")
.get(getProductById)
.patch(updateProductById)
.delete(deleteProductById);



export default productRouter;
