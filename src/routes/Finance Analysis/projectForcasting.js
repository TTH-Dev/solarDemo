import express from "express";
import {
    createProjectForcasting,
    getAllProjectForcasting,
    getProjectForcastingById,
    updateProjectForcasting,
    deleteProjectForcasting
} from "../../controllers/Finance Analysis/projectForcasting.js";

const projectForcastingRouter = express.Router();

projectForcastingRouter.post("/", createProjectForcasting);

projectForcastingRouter.get("/", getAllProjectForcasting);

projectForcastingRouter.get("/:id", getProjectForcastingById);

projectForcastingRouter.patch("/:id", updateProjectForcasting);

projectForcastingRouter.delete("/:id", deleteProjectForcasting);

export default projectForcastingRouter;
