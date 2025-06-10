import { ApiError } from "../utils/ApiError";
import Problem from "../models/problem.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadTestcasesToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createProblem = asyncHandler(async (req, res) => {
    const {title , difficulty, description, memoryLimit, timeLimit, inputFormat, outputFormat, sampleInput, sampleOutput, constraints, tagsstcases} = req.body;
    if(
        [title, difficulty, description, memoryLimit, timeLimit, inputFormat, outputFormat, sampleInput, sampleOutput, constraints, tags
        ].some(field => !field.trim() === "")
    )
    {
        throw new ApiError(400, "All fields are required");
    }

    const existingProblem = await Problem.findOne({ title });

    if (existingProblem) {
        throw new ApiError(400, "Problem with this title already exists");
    }

    const testcases = req.files?.avatar[0]?.path;

    if(!testcases){
            throw new ApiError(400, "Testcases are required");
        }
    
    const testcasesCloudinaryUrl = await uploadTestcasesToCloudinary(testcases);


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
        tags,
        testcases : testcasesCloudinaryUrl || null
    });

    if (!newProblem) {
        throw new ApiError(500, "SomeThing Went Wrong Creating Problem");
    }
    res.status(201).json(ApiResponse(201, newProblem, "Problem Created Successfully"));
})



export { createProblem };