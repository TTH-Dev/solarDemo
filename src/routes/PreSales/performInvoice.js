import express from "express";
import {
  createPerformInvoice,
  getAllPerformInvoices,
  getPerformInvoiceById,
  updatePerformInvoice,
  deletePerformInvoice,
  getAllPerformInvoicesByVendor
} from "../../controllers/PreSales/performInvoice.js";

const router = express.Router();

router.route("/")
  .get(getAllPerformInvoices)
  .post(createPerformInvoice);
  
  router.route("/getAllPerformInvoicesByVendor/:id").get(getAllPerformInvoicesByVendor)

router.route("/:id")
  .get(getPerformInvoiceById)
  .patch(updatePerformInvoice)
  .delete(deletePerformInvoice);

export default router;
