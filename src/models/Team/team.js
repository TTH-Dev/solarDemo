import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true,
    },
    members: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            },
            name: { type: String }
        }
    ],
    assignedProjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }]
});

const Team = mongoose.model("Team", teamSchema);

export default Team;