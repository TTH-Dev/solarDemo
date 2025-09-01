import mongoose from "mongoose";
const inspectionSchema = new mongoose.Schema({
    category: { type: String }, // e.g., "Solar Panel", "Solar DCDB"
    checks: [
        {
            name: { type: String }, // e.g., "Check Solar Panel Junction Box"
            status: { type: String, enum: ["Ok", "Not Ok", ""], default: "" },
            remarks: { type: String }
        }
    ],
    stringReadings: [
        {
            stringName: String, // e.g., "String 1"
            Vmp: String,
            Imp: String,
            remarks: String
        }
    ]
});
const licenseSchema = new mongoose.Schema({
    documentName: { type: String, required: true },
    documentUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({

    name: {
        type: String
    },
    process: [{
        processName: { type: String, },
        createdAt: { type: Date, default: Date.now() }
    }],
    processStatus: {
        type: String
    },
    attchments: [{
        type: String
    }],

    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Leads"
    },
    history: {
        processName: {
            type: String
        },
        finishedDate: {
            type: Date,
        },
        finishedBy: {
            type: String
        }
    },
    startDate: {
        type: Date
    },
    dueDate: {
        type: Date
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team"
    },
    memberType: {
        type: String
    },
    priority: { type: String },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    membersAddedAt: {
        type: Date,
        default: null
    },
    sampleQuotes: [{
        quotes: Number,
        addedBy: String,
        addedDate: Date
    }],
    solarInspection: [inspectionSchema],
    licenseDocuments: [licenseSchema],
    processStatus: {
        type: String,
        enum: ["draft", "in progress", "completed", "on hold", "cancelled"],
        default: "draft",
    },


}, { timestamps: true });

const Project = mongoose.model("Project", projectSchema);
export default Project;