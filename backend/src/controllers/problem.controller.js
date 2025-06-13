import  {ApiError}  from "../utils/ApiError.js";
import Problem from "../model/problem.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadTestCaseFileToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createProblem = asyncHandler(async (req, res) => {
    console.log("Creating Problem");
    console.log("Request Body: ", req.body);
    const {title , difficulty, description, memoryLimit, timeLimit, inputFormat, outputFormat, sampleInput, sampleOutput, constraints, testcases: testcasesBody} = req.body;

    // const tags = req.body.tags.split(',').map(tag => tag.trim());
    // if(
    //     [title, difficulty, description, memoryLimit, timeLimit, inputFormat, outputFormat, sampleInput, sampleOutput, constraints, testcasesBody]
    //     .some(field => !field.trim() === "")
    // )
    // {
    //     throw new ApiError(400, "All fields are required");
    // }

    const existingProblem = await Problem.findOne({ title });

    console.log("Existing Problem: ", existingProblem);

    if (existingProblem) {
        throw new ApiError(400, "Problem with this title already exists");
    }

    // const testcasesFilePath = req.file?.avatar[0]?.path;

    // console.log("Testcases File Path: ", req.file);

    // const testcases = req.body.testcases;

    // if(!testcases){
    //         throw new ApiError(400, "Testcases are required");
    //     }
    
    // const testcasesCloudinaryUrl = await uploadTestcasesToCloudinary(testcasesFilePath);


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
        // tags,
        testcases : testcasesBody || testcasesCloudinaryUrl || null
    });

    if (!newProblem) {
        throw new ApiError(500, "SomeThing Went Wrong Creating Problem");
    }
    res.status(201).json(ApiResponse(201, newProblem, "Problem Created Successfully"));
})



export { createProblem };