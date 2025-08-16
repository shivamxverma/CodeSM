import  {ApiError}  from "../utils/ApiError.js";
import Problem from "../models/problem.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateUploadURL } from "../../services/aws.service.js";
import Author from "../models/author.model.js";
import { generateHintsWithAI } from '../../services/ai.service.js'; 

const createProblem = asyncHandler(async (req, res) => {
    const {
        title,
        difficulty,
        description,
        memoryLimit,
        timeLimit,
        inputFormat,
        outputFormat,
        constraints,
        tags,
        editorial,
        editorialLink,
        code,
        sampleTestcases,
    } = req.body;

    if (!req.user || !req.user._id) {
        throw new ApiError(403, "Not Authorized");
    }

    const ExistUser = await Author.findById(req.user._id);

    if (!ExistUser) {
        throw new ApiError(403, "Not Authorized");
    }

    let tagsArray;
    if (Array.isArray(tags)) {
        tagsArray = tags.map(tag => tag.trim());
    } else if (typeof tags === "string") {
        try {
            tagsArray = JSON.parse(tags);
            if (!Array.isArray(tagsArray)) {
                tagsArray = tags.split(',').map(tag => tag.trim());
            }
        } catch {
            tagsArray = tags.split(',').map(tag => tag.trim());
        }
    } else {
        tagsArray = [];
    }

    const requiredFields = [
        title,
        difficulty,
        description,
        memoryLimit,
        timeLimit,
        inputFormat,
        outputFormat,
        sampleTestcases,
        constraints,
        editorial,
        editorialLink,
        code
    ];

    if (requiredFields.some(field => field === undefined || field === null || (typeof field === "string" && !field.trim()))) {
        throw new ApiError(400, "All fields are required");
    }

    const existingProblem = await Problem.findOne({ title });

    if (existingProblem) {
        throw new ApiError(400, "Problem with this title already exists");
    }
    
    // Parse the sampleTestcases string into a JSON array
    const parsedSampleTestcases = JSON.parse(sampleTestcases);

    const newProblem = await Problem.create({
        title,
        difficulty,
        description,
        memoryLimit,
        timeLimit,
        inputFormat,
        outputFormat,
        sampleTestcases: parsedSampleTestcases,
        constraints,
        editorial: editorial || "",
        editorialLink: editorialLink || "",
        tags: tagsArray,
        author: ExistUser,
        solution: code
    });

    if (!newProblem) {
        throw new ApiError(500, "SomeThing Went Wrong Creating Problem");
    }

    const uploadURL = await generateUploadURL(newProblem._id);

    if (!uploadURL) {
        throw new ApiError(500, "Somthing Went Wrong With Upload Url");
    }

    res.status(201).json(new ApiResponse(201, { newProblem, uploadURL }, "Problem Created Successfully"));
});


const getProblemById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const problem = await Problem.findById(id);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }       
    res.status(200).json(new ApiResponse(200, problem, "Problem fetched successfully"));    
});

const getAllProblems = asyncHandler(async (req, res) => {
    const problems = await Problem.find().select("-description -memoryLimit -timeLimit -inputFormat -outputFormat -sampleInput -sampleOutput -constraints").sort({ createdAt: -1 });
    if (!problems || problems.length === 0) {
        throw new ApiError(404, "No problems found");
    }
    res.status(200).json(new ApiResponse(200, problems, "Problems fetched successfully"));
});

const getUpsolveHints = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const problem = await Problem.findById(id);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }

    if (problem.hints && problem.hints.length > 0) {
        return res.status(200).json(new ApiResponse(200, { hints: problem.hints }, "Hints fetched successfully"));
    }

    const hints = await generateHintsWithAI(problem);

    if (!hints || hints.length === 0) {
        throw new ApiError(500, "Failed to generate hints");
    }

    res.status(200).json(new ApiResponse(200, { hints }, "Hints generated successfully"));
})


export { createProblem, getProblemById, getAllProblems ,getUpsolveHints };