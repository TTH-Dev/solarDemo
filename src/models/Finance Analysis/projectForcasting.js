    import mongoose from "mongoose";


    const projectForcastingSchema = new mongoose.Schema({

        lead: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Leads"
        },
        estimateProjectValye: [{
            name: {
                type: String
            },
            amount: {
                type: String
            }
        }],
        total: Number,
        addedBy: String,
        addedDate: Date
    }, { timestamps: true });


    const ProjectForcasting = mongoose.model("ProjectForcasting", projectForcastingSchema);
    export default ProjectForcasting;