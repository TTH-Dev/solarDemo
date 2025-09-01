import express from "express";
import {
    createReturnMaterial,
    getAllReturnMaterials,
    getSingleReturnMaterial,
    updateReturnMaterial,
    deleteReturnMaterial,
    getReturnmaterialByLead
} from "../../controllers/Finance Analysis/returnMaterial.js";

const returnMaterialRouter = express.Router();
    returnMaterialRouter.route("/getreturnmaterialbyLead").get(getReturnmaterialByLead)

returnMaterialRouter.route("/")
    .post(createReturnMaterial)
    .get(getAllReturnMaterials);


returnMaterialRouter.route("/:id")
    .get(getSingleReturnMaterial)
    .put(updateReturnMaterial)
    .delete(deleteReturnMaterial);

export default returnMaterialRouter;
