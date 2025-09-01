import express from "express";
import {
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    removeTeamMemeber,
    addTeamName
} from "../../controllers/Team/team.js";
import { protect } from "../../controllers/Admin/admin.js";
const teamrouter = express.Router();

teamrouter.use(protect);

teamrouter.route("/")
    .get(getAllTeams)
    .post(createTeam);

teamrouter.patch("/remove-mem", removeTeamMemeber);
teamrouter.patch("/add-mem", addTeamName);
teamrouter.route("/:id")
    .get(getTeamById)
    .patch(updateTeam)
    .delete(deleteTeam);

export default teamrouter;