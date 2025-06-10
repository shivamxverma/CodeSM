import { ApiError } from "../utils/ApiError";
import Problem from "../models/problem.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadTestcasesToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const sampleProblemData = {
    title: "Sum of Two Numbers",
    difficulty: 1,
    description: "Given two integers, find their sum.",
    memoryLimit: 256,
    timeLimit: 1000,
    inputFormat: "The first line contains two integers A and B separated by a single space.",
    outputFormat: "Output a single integer, the sum of A and B.",
    sampleInput: "5 3",
    sampleOutput: "8",
    constraints: "-10^9 <= A, B <= 10^9",
    tags: ["math", "basic", "addition"],
    testcases: "https://res.cloudinary.com/your-cloud-name/raw/upload/v1234567890/testcases/sum_two_numbers.txt",
    submission: []
};


const createProblem = asyncHandler(async (req, res) => {
    const {title , difficulty, description, memoryLimit, timeLimit, inputFormat, outputFormat, sampleInput, sampleOutput, constraints, testcases: testcasesBody} = req.body;
    if(
        [title, difficulty, description, memoryLimit, timeLimit, inputFormat, outputFormat, sampleInput, sampleOutput, constraints, testcases]
        .some(field => !field.trim() === "")
    )
    {
        throw new ApiError(400, "All fields are required");
    }

    const existingProblem = await Problem.findOne({ title });

    if (existingProblem) {
        throw new ApiError(400, "Problem with this title already exists");
    }

    const testcasesFilePath = req.files?.avatar[0]?.path;

    if(!testcases){
            throw new ApiError(400, "Testcases are required");
        }
    
    const testcasesCloudinaryUrl = await uploadTestcasesToCloudinary(testcasesFilePath);


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
        testcases : testcasesBody || testcasesCloudinaryUrl || null
    });

    if (!newProblem) {
        throw new ApiError(500, "SomeThing Went Wrong Creating Problem");
    }
    res.status(201).json(ApiResponse(201, newProblem, "Problem Created Successfully"));
})



export { createProblem };