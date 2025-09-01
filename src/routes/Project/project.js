import express from "express";
import {
    getAllProject,
    updateProject,
    deleteProjectProcess,
    ProjectaddTeam,
    getProjectById,
    addSamplequatos,
    addSolarInspection,
    addLicenseDocuments,
    updateProjectStatus
} from "../../controllers/Project/project.js";
import { uploadCustomImage } from "../../utils/multerConfig.js";

const projectRouter = express.Router();



projectRouter.route("/").get(getAllProject);

projectRouter.route("/addQuatos/:id").patch(addSamplequatos);

projectRouter.route("/addTeam/:id").patch(ProjectaddTeam);
projectRouter.route("/del/:id").patch(deleteProjectProcess);
projectRouter.route("/:id").patch(updateProject).get(getProjectById); 
projectRouter.route("/update-status").put(updateProjectStatus )
projectRouter.route("/addInspection/:id").patch(addSolarInspection);
projectRouter
  .route("/addLicense/:id")
  .patch(uploadCustomImage, addLicenseDocuments);
export default projectRouter;