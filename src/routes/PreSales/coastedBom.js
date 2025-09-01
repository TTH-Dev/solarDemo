import express from 'express';

import {
    createCoastedBom,
    getAllCoastedBom,
    getCoastedBomById,
    updateCoastedBom,
    deleteCoastedBom
} from "../../controllers/PreSales/coastedBom.js";

import { protect } from "../../controllers/Admin/admin.js";


const coastedBomRouter = express.Router();

coastedBomRouter.use(protect);

coastedBomRouter.route("/").patch(createCoastedBom).get(getAllCoastedBom);

coastedBomRouter.route("/:id").get(getCoastedBomById).put(updateCoastedBom).delete(deleteCoastedBom);


export default coastedBomRouter;