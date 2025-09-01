import express from 'express';

import {
    createBOM,
    getAllBOM,
    getBOMById,
    updateBOM,
    deleteBOM,
    getInventoryCheck,
    getBOMById1,
    updateProjectExtraRequestQuantity,
    extraProduct
} from "../../controllers/PreSales/bom.js";

import { protect } from "../../controllers/Admin/admin.js";


const bomRouter = express.Router();

bomRouter.use(protect);

bomRouter.route("/").post(createBOM).get(getAllBOM);

bomRouter.route("/ic/:leadId").get(getInventoryCheck);

bomRouter.route("/:id").get(getBOMById).patch(updateBOM).delete(deleteBOM);

bomRouter.route("/bom/:id").get(getBOMById1)

bomRouter.patch("/:bomId/product/:productId", updateProjectExtraRequestQuantity);

bomRouter.post('/:bomId/extra-products', extraProduct)


export default bomRouter;