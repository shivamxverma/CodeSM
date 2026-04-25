import { IGetSubmissionResponse, IGetSubmissionResultsResponse } from './submission-types';
import { submission, executionResult, user, problem } from '../../db/schema';
import { db } from '../../loaders/postgres';
import redis from '../../loaders/redis';
import { eq, and, desc } from 'drizzle-orm';
import ApiError from '../../utils/ApiError';
import httpStatus from 'http-status';
import { createRunQueue, createSubmitQueue } from './submission-helper';

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

        const prob = await db
            .select({
                timeLimit : problem.timeLimit,
                memoryLimit : problem.memoryLimit
            })
            .from(problem)
            .where(eq(problem.id, problemId));

        if(prob.length === 0){
            return {
                submissionId : submissionId,
                status : "FAILED",
                startedAt : new Date(),
            }
        }

        try {
            if (normalizedMode === "RUN") {
                await createRunQueue(submissionId, code, language, problemId, prob[0].timeLimit, prob[0].memoryLimit);
            } else {
                await createSubmitQueue(submissionId, code, language, problemId, prob[0].timeLimit, prob[0].memoryLimit);
            }

            return {
                submissionId: submissionId,
                status: 'PENDING',
                startedAt : new Date(),
            };
        } catch (queueError) {
            console.error("Queue error:", queueError);
            return {
                submissionId: submissionId,
                status: 'FAILED',
                startedAt : new Date(),
            };
        }
    } catch (dbError) {
        console.error("Database error:", dbError);
        return {
            submissionId: "",
            status: 'ERROR',
            startedAt : new Date(),
        };
    }
}

export const handlegetSubmissionStatus = async (
    userId: string,
    submissionId: string
): Promise<IGetSubmissionResponse> => {
    try {

        const redisStatus = await redis.get(`submission:${submissionId}`);
        if (redisStatus) {
            const parsed = JSON.parse(redisStatus);
            return {
                submissionId,
                status: parsed.status,
                startedAt : new Date(parsed.createdAt),
            };
        }

        const [result] = await db
            .select({
                id: submission.id,
                status: submission.status,
                createdAt: submission.createdAt,
            })
            .from(submission)
            .where(eq(submission.id, submissionId));

        if (!result) {
            throw new ApiError('Submission not found', httpStatus.NOT_FOUND);
        }

        return {
            submissionId: result.id,
            status: result.status,
            startedAt : new Date(result.createdAt),
        };
    } catch (error) {
        console.error("Database error:", error);
        return {
            submissionId: "",
            status: 'ERROR',
            startedAt : null,
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

export const handleGetAllSubmissions = async (userId: string, problemId: string) => {
    try {
        const results = await db
            .select({
                id: submission.id,
                language: submission.language,
                status: submission.status,
                verdict: executionResult.verdict,
                timeTaken: submission.timeTaken,
                memoryTaken: submission.memoryTaken,
                createdAt: submission.createdAt,
                user: {
                    username: user.username
                }
            })
            .from(submission)
            .innerJoin(user, eq(user.id, submission.userId))
            .leftJoin(executionResult, eq(executionResult.submissionId, submission.id))
            .where(
                and(
                    eq(submission.userId, userId),
                    eq(submission.problemId, problemId),
                    eq(submission.mode, 'SUBMIT') // Only show SUBMIT, not RUN
                )
            )
            .orderBy(desc(submission.createdAt));

        // Format the results to consolidate status and verdict
        return results.map(r => ({
            _id: r.id, // Frontend expects this or idx as key
            language: r.language,
            status: r.verdict && r.verdict !== 'PENDING' ? r.verdict : r.status,
            timeTaken: r.timeTaken,
            memoryTaken: r.memoryTaken,
            createdAt: r.createdAt,
            user: {
                username: r.user.username
            }
        }));
    } catch (error) {
        console.error("Database error in handleGetAllSubmissions:", error);
        throw new ApiError('Failed to fetch submissions', httpStatus.INTERNAL_SERVER_ERROR);
    }
}
