import express from "express";
import {
  createDeliveryChellan,
  getAllDeliveryChellans,
  getDeliveryChellanById,
  updateDeliveryChellan,
  deleteDeliveryChellan,
} from "../../controllers/Project/deliveryChellan.js";

import { uploadCompanyImages } from "../../utils/multerConfig.js";

const deliveryChellanRouter = express.Router();

deliveryChellanRouter
  .route("/")
  .get(getAllDeliveryChellans)
  .post(uploadCompanyImages,createDeliveryChellan);

deliveryChellanRouter
  .route("/:id")
  .get(getDeliveryChellanById)
  .put(uploadCompanyImages,updateDeliveryChellan)
  .delete(deleteDeliveryChellan);

export default deliveryChellanRouter;
