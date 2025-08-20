import  {ApiError}  from "../utils/ApiError.js";
import Problem from "../models/problem.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateUploadURL } from "../../services/aws.service.js";
import Author from "../models/author.model.js";
import { generateHintsWithAI } from '../../services/ai.service.js'; 
import redis from "../config/redis.config.js";

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

    const cacheExpiry = 60 * 60;
    redis.setex(`problem:${newProblem._id}`, cacheExpiry, JSON.stringify(newProblem));

    const allProblems = await Problem.find().select("-description -memoryLimit -timeLimit -inputFormat -outputFormat -sampleTestcases -constraints -hints -submission -editorial -editorialLink -solution").sort({ createdAt: -1 });
    redis.setex('allProblems', cacheExpiry, JSON.stringify(allProblems));


    res.status(201).json(new ApiResponse(201, { newProblem, uploadURL }, "Problem Created Successfully"));
});


const getProblemById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const cachedProblem = await redis.get(`problem:${id}`);

    if (cachedProblem) {
        return res.status(200).json(new ApiResponse(200, JSON.parse(cachedProblem), "Problem fetched successfully from cache"));
    }

    const problem = await Problem.findById(id);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }       

    const cacheExpiry = 60 * 60;
    redis.setex(`problem:${id}`, cacheExpiry, JSON.stringify(problem));

    res.status(200).json(new ApiResponse(200, problem, "Problem fetched successfully"));    
});

const getAllProblems = asyncHandler(async (req, res) => {
    console.log("Entering into problems");
    const cachedProblems = await redis.get('allProblems');
    if (
        cachedProblems &&
        typeof cachedProblems === "string" &&
        cachedProblems.trim().length !== 0 &&
        cachedProblems.trim() !== "[]"
    ) {
        return res.status(200).json(new ApiResponse(200, JSON.parse(cachedProblems), "Problems fetched successfully from cache"));
    }

    
    const problems = await Problem.find().select("-description -memoryLimit -timeLimit -inputFormat -outputFormat -sampleTestcases -constraints -hints -submission -editorial -editorialLink -solution").sort({ createdAt: -1 });

    if (!problems || problems.length === 0) {
        throw new ApiError(404, "No problems found");
    }

    const cacheExpiry = 60 * 60;
    redis.setex('allProblems', cacheExpiry, JSON.stringify(problems));

    res.status(200).json(new ApiResponse(200, problems, "Problems fetched successfully"));
});

const getUpsolveHints = asyncHandler(async (req, res) => {
    const cachedHints = await redis.get(`hints:${req.params.id}`);
    if (cachedHints) {
        return res.status(200).json(new ApiResponse(200, JSON.parse(cachedHints), "Hints fetched successfully from cache"));
    }

    
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

    const cacheExpiry = 60 * 60;
    redis.setex(`hints:${req.params.id}`, cacheExpiry, JSON.stringify(hints));

    problem.hints = hints;
    await problem.save();

    res.status(200).json(new ApiResponse(200, { hints }, "Hints generated successfully"));
})


export { createProblem, getProblemById, getAllProblems ,getUpsolveHints };