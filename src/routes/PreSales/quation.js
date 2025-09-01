import express from "express";
import {
    createQuotation,
    getAllQuotations,
    getQuotationById,
    updateQuotation,
    deleteQuotation,
} from "../../controllers/PreSales/quation.js";

const quatationRouter = express.Router();

quatationRouter
    .route("/")
    .post(createQuotation)
    .get(getAllQuotations);

quatationRouter
    .route("/:id")
    .get(getQuotationById)
    .put(updateQuotation)
    .delete(deleteQuotation);

export default quatationRouter;
