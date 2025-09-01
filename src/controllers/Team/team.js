import Team from "../../models/Team/team.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import APIFeatures from "../../utils/ApiFeatures.js";
import User from "../../models/Members/User.js";

export const createTeam = catchAsync(async (req, res, next) => {
    const { name, members } = req.body;

    const memberDetails = [];

    for (const memberId of members) {
        const member = await User.findById(memberId);

        if (member) {
            memberDetails.push({
                id: member._id,
                name: member.name,
            });
        }
    }

    const data = {
        name,
        members: memberDetails,
    };

    const team = await Team.create(data);

    res.status(201).json({
        status: "success",
        message: "Team created successfully",
        data: { team },
    });
});


export const getAllTeams = catchAsync(async (req, res, next) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;


    let filter = {};

    if (req.query.name) [
        filter.name = req.query.name
    ]
    const features = new APIFeatures(Team.find(filter), req.query)
        .limitFields()
        .sort()
        .paginate();

    const teams = await features.query;

    const totalRecords = await Team.countDocuments(filter);

    const totalPages = Math.ceil(totalRecords / limit);

    const teamNames = await Team.find().distinct("name");

    res.status(200).json({
        status: "success",
        totalPages,
        currentPage: page,
        result: teams.length,
        data: { teams, teamNames },
    });
});

export const getTeamById = catchAsync(async (req, res, next) => {
const team = await Team.findById(req.params.id).populate("members.id");

    if (!team) {
        return next(new AppError("Team not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { team },
    });
});

export const updateTeam = catchAsync(async (req, res, next) => {

    const { id } = req.params;

    const updatedTeam = await Team.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedTeam) {
        return next(new AppError("Team not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { updatedTeam },
    });
});

export const deleteTeam = catchAsync(async (req, res, next) => {
    const deletedTeam = await Team.findByIdAndDelete(req.params.id);

    if (!deletedTeam) {
        return next(new AppError("Team not found", 404));
    }

    res.status(204).json({
        status: "success",
        data: null,
    });
});

export const removeTeamMemeber = catchAsync(async (req, res, next) => {

    const { id } = req.query;

    const { members } = req.body;


    console.log(members);

    const team = await Team.findByIdAndUpdate(
        id,
        { $pull: { members: { id: members } } },
        { new: true }
    );
    if (!team) {
        return next(new AppError("Team Not Found!", 404));
    }
    res.status(200).json({
        status: "Success",
        data: {
            team
        }
    });
});

export const addTeamName = catchAsync(async (req, res, next) => {

    const { id } = req.query;

    const { members } = req.body;


    const user = await User.findById(members);


    const member = {
        id: user._id,
        name: user.name
    }


    const team = await Team.findByIdAndUpdate(
        id,
        { $push: { members: member } },
        { new: true }
    );
    if (!team) {
        return next(new AppError("Team Not Found!", 404));
    }
    res.status(200).json({
        status: "Success",
        data: {
            team
        }
    });
});