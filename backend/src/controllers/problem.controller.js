import  {ApiError}  from "../utils/ApiError.js";
import Problem from "../model/problem.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadTestCaseFileToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createProblem = asyncHandler(async (req, res) => {
    // console.log("Creating Problem");
    // console.log("Request Body: ", req.body);
    const {title , difficulty, description, memoryLimit, timeLimit, inputFormat, outputFormat, sampleInput, sampleOutput, constraints,tags} = req.body;

    const tagsArray = tags.split(',').map(tag => tag.trim());
    if(
        [title, difficulty, description, memoryLimit, timeLimit, inputFormat, outputFormat, sampleInput, sampleOutput, constraints]
        .some(field => !field.trim() === "")
    )
    {
        throw new ApiError(400, "All fields are required");
    }

    const existingProblem = await Problem.findOne({ title });

    // console.log("Existing Problem: ", existingProblem);

    if (existingProblem) {
        throw new ApiError(400, "Problem with this title already exists");
    }

    // console.log(req.file);

    const testcasesFilePath = req.file?.path;

    // console.log("Testcases File Path: ", testcasesFilePath);

    // const testcases = req.body.testcases;

    // if(!testcases){
    //         throw new ApiError(400, "Testcases are required");
    //     }
    
    const testcasesCloudinaryUrl = await uploadTestCaseFileToCloudinary(testcasesFilePath);
    // console.log("Testcases Cloudinary URL: ", testcasesCloudinaryUrl.url);

    // const authorId = "68483f7d391860b5e5e9d460";

    // console.log('')


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
        tags : tagsArray,
        testcases: testcasesCloudinaryUrl.url || null
    });

    if (!newProblem) {
        throw new ApiError(500, "SomeThing Went Wrong Creating Problem");
    }
    res.status(201).json(new ApiResponse(201, newProblem, "Problem Created Successfully"));
})



const getProblemById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const problem = await Problem.findById(id);
    if (!problem) {
        throw new ApiError(404, "Problem not found");
    }       
    res.status(200).json(new ApiResponse(200, problem, "Problem fetched successfully"));    
});


export { createProblem , getProblemById};