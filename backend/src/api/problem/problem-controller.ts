import { jwtReq } from "../../types";
import asyncHandler from "../../utils/asyncHandler";
import { Response } from "express";
import ApiError from "../../utils/ApiError";
import { ICreateProblemRequest } from "./problem-types";
import { handleCreateProblem , handleFinalizeProblem, handleGetProblems, handleGetProblemById, handleGetEditorialSolution, handleGetEditorialContent , handleGetHints} from './problem-service'

export const createProblem = asyncHandler(async (req: jwtReq, res: Response) => {
    const response = await handleCreateProblem(req.user.id, req.body);
    return res.status(200).json({
        status: 'success',
        message: 'Problem created successfully',
        data: response
    })
})

export const finalizeProblem = asyncHandler(async (req: jwtReq, res: Response) => {
    const problemId = req.query.problemId as string;
    await handleFinalizeProblem(req.user.id, problemId);
    return res.status(200).json({
        status: 'success',
        message: 'Problem finalized successfully'
    })  
})

export const getProblems = asyncHandler(async (req: jwtReq, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string;
    const response = await handleGetProblems({ limit, cursor });
    return res.status(200).json({
        status: 'success',
        message: 'Problems fetched successfully',
        data: response
    })
})

export const getProblemById = asyncHandler(async (req: jwtReq, res: Response) => {
    const problemId = req.params.problemId as string;
    const response = await handleGetProblemById(problemId);
    return res.status(200).json({
        status: 'success',
        message: 'Problem fetched successfully',
        data: response
    })
});

export const getEditorialSolution = asyncHandler(async (req: jwtReq, res: Response) => {
    const problemId = req.params.problemId as string;
    const response = await handleGetEditorialSolution(problemId);
    return res.status(200).json({
        status: 'success',
        message: 'Editorial solution fetched successfully',
        data: response
    })
})

export const getEditorialContent = asyncHandler(async (req: jwtReq, res: Response) => {
    const problemId = req.params.problemId as string;
    const response = await handleGetEditorialContent(problemId);
    return res.status(200).json({
        status: 'success',
        message: 'Editorial solution fetched successfully',
        data: response
    })
})

export const getHints = asyncHandler(async( req: jwtReq, res: Response) => {
    const problemId = req.params.problemId as string;
    const response = await handleGetHints(problemId);

    if(response.length > 0) {
        return res.status(200).json({
            status : 'success',
            message : 'Hints are generated successfully',
            data : response
        })
    }else{
        return res.status(200).json({
            status : 'success',
            message : 'Hints are not generated yet',
            data : []
        })
    }
})
    
    

    