import {ApiError} from "../utils/ApiError.js";
import Submission from "../model/submission.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { runCppCodeWithInput} from "../utils/runCode.js"; 

const createSubmission = asyncHandler(async (req, res) => {
    const { code, language , problemId } = req.body;
    // const problemId = req.params.problemId;

    // console.log(req.body);

    const user = "68483f7d391860b5e5e9d460";

    if ([problemId, user, code, language].some(field => !field.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    const newSubmission = await Submission.create({
        // user,
        // problemId,
        code,
        // language
    });

    // console.log("New submission created:", newSubmission);

    const output = await runCppCodeWithInput(code, "5\n2 3\n4 5\n6 7\n9 20\n11 18");

    console.log("Code execution result:",output);

    if (!newSubmission) {
        throw new ApiError(500, "Something went wrong creating submission");
    }


    // console.log("New submission created:", newSubmission);


    // console.log("Submission details:", { problemId, userId, language });

    res.status(201).json(new ApiResponse(201, newSubmission, "Submission created successfully"));
})

export { createSubmission };
