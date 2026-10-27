import { IGetSubmissionResponse, IGetSubmissionResultsResponse } from './submission-types';
import { submission, executionResult, user, problem } from 'db-schema';
import { db } from '../../loaders/postgres';
import redis from '../../loaders/redis';
import { eq, and, desc, count, sql } from 'drizzle-orm';
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
        const [dbResult] = await db
            .select({
                id: submission.id,
                status: submission.status,
                createdAt: submission.createdAt,
            })
            .from(submission)
            .where(eq(submission.id, submissionId));

        if (!dbResult) {
            throw new ApiError('Submission not found', httpStatus.NOT_FOUND);
        }

        const redisStatus = await redis.get(`submission:${submissionId}`);
        if (redisStatus) {
            const parsed = JSON.parse(redisStatus);

            const redisState = String(parsed?.status || '').toUpperCase();
            const dbState = String(dbResult.status || '').toUpperCase();
            const dbIsTerminal = dbState === 'COMPLETED' || dbState === 'FAILED';
            const redisIsNonTerminal = redisState === 'PENDING' || redisState === 'RUNNING';

            // If Redis is stale (still running/pending) but DB is already terminal,
            // trust DB to avoid frontend getting stuck in "Running".
            if (dbIsTerminal && redisIsNonTerminal) {
                return {
                    submissionId: dbResult.id,
                    status: dbResult.status,
                    startedAt: new Date(dbResult.createdAt),
                };
            }

            return {
                submissionId,
                status: parsed.status,
                startedAt: new Date(parsed.updatedAt || parsed.createdAt || dbResult.createdAt),
            };
        }

        return {
            submissionId: dbResult.id,
            status: dbResult.status,
            startedAt : new Date(dbResult.createdAt),
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

export const handleGetUserDashboardStats = async (userId: string) => {
    try {
        // Recent submissions (last 20 across all problems)
        const recentSubs = await db
            .select({
                id: submission.id,
                language: submission.language,
                status: submission.status,
                verdict: executionResult.verdict,
                timeTaken: submission.timeTaken,
                memoryTaken: submission.memoryTaken,
                createdAt: submission.createdAt,
                problemId: submission.problemId,
                problemTitle: problem.title,
                problemSlug: problem.slug,
                problemDifficulty: problem.difficulty,
            })
            .from(submission)
            .leftJoin(executionResult, eq(executionResult.submissionId, submission.id))
            .leftJoin(problem, eq(problem.id, submission.problemId))
            .where(and(eq(submission.userId, userId), eq(submission.mode, 'SUBMIT')))
            .orderBy(desc(submission.createdAt))
            .limit(20);

        // Total submissions count
        const [totalRow] = await db
            .select({ count: count() })
            .from(submission)
            .where(and(eq(submission.userId, userId), eq(submission.mode, 'SUBMIT')));

        // Accepted problems (distinct problems with ACCEPTED verdict)
        const acceptedProblems = await db
            .selectDistinct({ problemId: submission.problemId })
            .from(submission)
            .innerJoin(executionResult, eq(executionResult.submissionId, submission.id))
            .where(and(
                eq(submission.userId, userId),
                eq(submission.mode, 'SUBMIT'),
                eq(executionResult.verdict, 'ACCEPTED')
            ));

        // Group accepted by difficulty
        const acceptedWithDiff = await db
            .selectDistinct({ problemId: submission.problemId, difficulty: problem.difficulty })
            .from(submission)
            .innerJoin(executionResult, eq(executionResult.submissionId, submission.id))
            .innerJoin(problem, eq(problem.id, submission.problemId))
            .where(and(
                eq(submission.userId, userId),
                eq(submission.mode, 'SUBMIT'),
                eq(executionResult.verdict, 'ACCEPTED')
            ));

        const easyCount   = acceptedWithDiff.filter(r => r.difficulty === 'EASY').length;
        const mediumCount = acceptedWithDiff.filter(r => r.difficulty === 'MEDIUM').length;
        const hardCount   = acceptedWithDiff.filter(r => r.difficulty === 'HARD').length;

        const formatted = recentSubs.map(r => ({
            id: r.id,
            language: r.language,
            status: r.verdict && r.verdict !== 'PENDING' ? r.verdict : r.status,
            timeTaken: r.timeTaken,
            memoryTaken: r.memoryTaken,
            createdAt: r.createdAt,
            problem: {
                id: r.problemId,
                title: r.problemTitle,
                slug: r.problemSlug,
                difficulty: r.problemDifficulty,
            },
        }));

        return {
            totalSubmissions: totalRow?.count ?? 0,
            totalSolved: acceptedProblems.length,
            solvedByDifficulty: { easy: easyCount, medium: mediumCount, hard: hardCount },
            recentSubmissions: formatted,
        };
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return {
            totalSubmissions: 0,
            totalSolved: 0,
            solvedByDifficulty: { easy: 0, medium: 0, hard: 0 },
            recentSubmissions: [],
        };
    }
};

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
