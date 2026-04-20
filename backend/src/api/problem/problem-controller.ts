import { jwtReq } from "../../types";
import asyncHandler from "../../utils/asyncHandler";
import { Response } from "express";
import ApiError from "../../utils/ApiError";
import { ICreateProblemRequest } from "./problem-types";
import { handleCreateProblem , handleFinializeProblem} from './problem-service'



export const createProblem = asyncHandler(async (req: jwtReq, res: Response) => {
    const response = await handleCreateProblem(req.user.id, req.body);
    return res.status(200).json({
        status: 'success',
        message: 'Problem created successfully',
        data: response
    })
})

export const finializeProblem = asyncHandler(async (req: jwtReq, res: Response) => {
    const response = await handleFinializeProblem(req.user.id, req.body);
    return res.status(200).json({
        status: 'success',
        message: 'Problem finalized successfully',
        data: response
    })  
})
    
    