import express from "express";
import {
    createOrganization,
    getAllOrganizations,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
} from "../../controllers/Admin/organization.js";
import { protect } from "../../controllers/Admin/admin.js";
import { uploadCompanyImages } from "../../utils/multerConfig.js";
const oraganizationrouter = express.Router();

oraganizationrouter.use(protect);

oraganizationrouter.route("/")
    .get(getAllOrganizations)
    .post(uploadCompanyImages, createOrganization);

oraganizationrouter.route("/:id")
    .get(getOrganizationById)
    .patch(uploadCompanyImages, updateOrganization)
    .delete(deleteOrganization);

export default oraganizationrouter;