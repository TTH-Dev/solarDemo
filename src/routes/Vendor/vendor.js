import express from "express";
import {
    createVendor,
    getAllVendors,
    getVendorById,
    updateVendor,
    deleteVendor
} from "../../controllers/Vendor/vendor.js";
import { protect } from "../../controllers/Admin/admin.js";
const vendorrouter = express.Router();

vendorrouter.use(protect);

vendorrouter.route("/")
    .get(getAllVendors)
    .post(createVendor);

vendorrouter.route("/:id")
    .get(getVendorById)
    .patch(updateVendor)
    .delete(deleteVendor);

export default vendorrouter;