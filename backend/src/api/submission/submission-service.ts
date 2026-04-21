import { IGetSubmissionResponse, IGetSubmissionResultsResponse } from './submission-types';
import { submission, executionResult } from '../../db/schema';
import { db } from '../../loaders/postgres';
import { myQueue } from '../../loaders/queue';
import redis from '../../loaders/redis';
import { eq } from 'drizzle-orm';
import ApiError from '../../utils/ApiError';
import httpStatus from 'http-status';

export const handleCreateSubmission = async (
    userId: string,
    problemId: string,
    code: string,
    language: string,
    mode: string
): Promise<IGetSubmissionResponse> => {
    // Normalize and cast enums
    const normalizedLanguage = language.toUpperCase() as any;
    const normalizedMode = mode.toUpperCase() as any;

    try {
        const [insertedSubmission] = await db
            .insert(submission)
            .values({
                userId,
                problemId,
                code: code,
                language: normalizedLanguage,
                mode: normalizedMode,
                status: 'PENDING',
            })
            .returning({ id: submission.id });

        const submissionId = insertedSubmission.id;

        try {
            await myQueue.add('job-queue', {
                submissionId,
                mode: normalizedMode
            });
            return {
                submissionId: submissionId,
                status: 'PENDING',
            };
        } catch (queueError) {
            console.error("Queue error:", queueError);
            return {
                submissionId: submissionId,
                status: 'FAILED',
            };
        }
    } catch (dbError) {
        console.error("Database error:", dbError);
        return {
            submissionId: "",
            status: 'ERROR',
        };
    }
}

export const handlegetSubmissionStatus = async (
    userId: string,
    submissionId: string
): Promise<IGetSubmissionResponse> => {
    try {
        const [result] = await db
            .select()
            .from(submission)
            .where(eq(submission.id, submissionId));

        if (!submission) {
            throw new ApiError('Submission not found', httpStatus.NOT_FOUND);
        }

        return {
            submissionId: result.id,
            status: result.status,
        };
    } catch (error) {
        console.error("Database error:", error);
        return {
            submissionId: "",
            status: 'ERROR',
        };
    }
}

export const handleGetSubmissionResults = async (
    userId: string,
    submissionId: string
): Promise<IGetSubmissionResultsResponse> => {
    try {
        const [result] = await db
            .select({
                id: submission.id,
                verdict: executionResult.verdict,
                language: submission.language,
                timeTaken: submission.timeTaken,
                memoryTaken: submission.memoryTaken,
                totalTestCases: submission.totalTestcases,
                passedTestCases: submission.passedTestcases,
                failedTestCases: submission.failedTestcases,
                stdout: executionResult.stdout,
                stderr: executionResult.stderr,  
            })
            .from(submission)
            .where(eq(submission.id, submissionId)) 
            .innerJoin(executionResult, eq(executionResult.submissionId, submission.id));

        if (!result) {
            throw new ApiError('Submission not found', httpStatus.NOT_FOUND);
        }

        return {
            submissionId: result.id,
            verdict: result.verdict,
            language: result.language,
            timeTaken: result.timeTaken,
            memoryTaken: result.memoryTaken,
            totalTestcases: result.totalTestCases,
            passedTestcases: result.passedTestCases,
            failedTestcases: result.failedTestCases,
            stdout: result.stdout || "",
            stderr: result.stderr || "",
        } as IGetSubmissionResultsResponse;
    }catch(error){
        console.error("Database error:", error);
        return {
            submissionId: "",
            verdict: "ERROR",
            language: "",
            timeTaken: 0,
            memoryTaken: 0,
            totalTestcases: 0,
            passedTestcases: 0,
            failedTestcases: 0,
            stdout: "",
            stderr: "",
        } as IGetSubmissionResultsResponse;
    }
}
