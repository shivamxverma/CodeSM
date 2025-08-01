import  {ApiError}  from "../utils/ApiError.js";
import Problem from "../models/problem.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateUploadURL } from "../../services/aws.service.js";

const createProblem = asyncHandler(async (req, res) => {
    const {title , difficulty, description, memoryLimit, timeLimit, inputFormat, outputFormat, sampleInput, sampleOutput, constraints, tags} = req.body;

    // console.log(req.body);

    const tagsArray = tags.split(',').map(tag => tag.trim());
    if(
        [title, difficulty, description, memoryLimit, timeLimit, inputFormat, outputFormat, sampleInput, sampleOutput, constraints]
        .some(field => !field.trim())
    )
    {
        throw new ApiError(400, "All fields are required");
    }

    // console.log(tagsArray);

    const existingProblem = await Problem.findOne({ title });

    // console.log(existingProblem);

    if (existingProblem) {
        throw new ApiError(400, "Problem with this title already exists");
    }

    const newProblem = await Problem.create({
        title,
        difficulty,
        description,
        memoryLimit,
        timeLimit,
        inputFormat,
        outputFormat,
        sampleInput,
        sampleOutput,
        constraints,
        tags : tagsArray
    });

    if (!newProblem) {
        throw new ApiError(500, "SomeThing Went Wrong Creating Problem");
    }

    const uploadURL = await generateUploadURL(newProblem._id);

    if(!uploadURL){
        throw new ApiError(500,"Somthing Went Wrong With Upload Url");
    }


    res.status(201).json(new ApiResponse(201, {newProblem,uploadURL}, "Problem Created Successfully"));
})



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


export { createProblem, getProblemById, getAllProblems };