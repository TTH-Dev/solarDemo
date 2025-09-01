import express from "express";


import {
    createPurchase,
    getAllPurchase,
    updatePurchase,
    getPurchaseById,
    deletePurchase
} from "../../controllers/PreSales/purchase.js";


const purchaseRouter = express.Router();


purchaseRouter.route("/").get(getAllPurchase).post(createPurchase);

purchaseRouter.route("/:id").get(getPurchaseById).patch(updatePurchase).delete(deletePurchase);

export default purchaseRouter;