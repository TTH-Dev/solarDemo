import express from "express";
import {
  createPerformInvoice,
  getAllPerformInvoices,
  getPerformInvoiceById,
  updatePerformInvoice,
  deletePerformInvoice,
  getAllPerformInvoicesByVendor
} from "../../controllers/PreSales/performInvoice.js";
import { upload } from "../../utils/multerConfig.js";

const router = express.Router();

router.route("/")
  .get(getAllPerformInvoices)
  .post(upload.any("attachments"),createPerformInvoice);
  
  router.route("/getAllPerformInvoicesByVendor/:id").get(getAllPerformInvoicesByVendor)

router.route("/:id")
  .get(getPerformInvoiceById)
  .patch(upload.any("attachments"),updatePerformInvoice)
  .delete(deletePerformInvoice);

export default router;
