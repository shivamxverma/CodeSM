import { ICreateProblemRequest, ICreateProblemResponse, IFinalizeProblemResponse,IProblem, IGetProblemsResponse,IAProblem, IProblemEditorialResponse } from "./problem-types";
import { verifyProblemCreationPermission } from './problem-helper';
import { db } from '../../loaders/postgres';
import { problem, editorial, tag, problemTag,testcase } from '../../db/schema';
import { eq, desc, inArray, and, lt, or } from 'drizzle-orm';
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import { generateUploadURL, fetchTestcasesFromS3, fetchFileFromS3 } from '../../services/aws.service';
import { createId } from '@paralleldrive/cuid2';

export const handleCreateProblem = async (
    userId: string,
    input: ICreateProblemRequest
): Promise<ICreateProblemResponse> => {
    await verifyProblemCreationPermission(userId);

    try {
        const existingProblem = await db
            .select()
            .from(problem)
            .where(eq(problem.slug, input.slug));

        if (existingProblem.length > 0) {
            throw new ApiError('Problem already exists', httpStatus.BAD_REQUEST);
        }

        // 1. Pre-generate problemId
        const problemId = createId();
        const key = `problems/${problemId}`;

        // 2. Parallelize S3 Presigned URL Generation
        // Prepare all promises for normal and sample testcases
        const testcasePromises = Array.from({ length: input.testcases }).map((_, i) => {
            const fileName = `testcase_${i}.json`;
            return generateUploadURL(key, fileName).then(url => ({ 
                url, 
                fileName, 
                order: i, 
                isSample: false,
                isHidden: i >= Math.min(3, input.testcases)
            }));
        });

        const samplePromises = Array.from({ length: input.sampleTestcases }).map((_, i) => {
            const fileName = `sampleTestcase_${i}.json`;
            return generateUploadURL(key, fileName).then(url => ({ 
                url, 
                fileName, 
                order: i, 
                isSample: true,
                isHidden: false
            }));
        });

        const allTestData = await Promise.all([...testcasePromises, ...samplePromises]);
        const uploadUrls = allTestData.map(d => d.url);

        // 3. Consolidate ALL database operations in a single transaction
        await db.transaction(async (tx) => {
            // A. Create the Problem
            await tx.insert(problem).values({
                id: problemId,
                title: input.title,
                description: input.description,
                slug: input.slug,
                difficulty: input.difficulty as any,
                authorId: userId,
                inputFormat: input.inputFormat,
                outputFormat: input.outputFormat,
                constraints: input.constraints,
                timeLimit: input.timeLimit,
                memoryLimit: input.memoryLimit,
            });

            // B. Create the Editorial
            await tx.insert(editorial).values({
                problemId: problemId,
                contentS3Key: `${key}/content.md`,
                solutionS3Key: `${key}/solution.md`,
                editorialLink: input.editorialLink,
            });

            // C. Associate Tags (Bulk associate after ensuring tags exist)
            if (input.tags && input.tags.length > 0) {
                const uniqueTagNames = [...new Set(input.tags)];
                const tagIds: string[] = [];
                for (const tagName of uniqueTagNames) {
                    const insertedTag = await tx.insert(tag)
                        .values({ name: tagName })
                        .onConflictDoUpdate({ 
                            target: tag.name, 
                            set: { name: tagName } 
                        })
                        .returning({ id: tag.id });
                    tagIds.push(insertedTag[0].id);
                }

                if (tagIds.length > 0) {
                    await tx.insert(problemTag).values(
                        tagIds.map(tagId => ({
                            problemId: problemId,
                            tagId: tagId,
                        }))
                    ).onConflictDoNothing();
                }
            }

            // D. Bulk insert all testcase records
            if (allTestData.length > 0) {
                await tx.insert(testcase).values(
                    allTestData.map(td => ({
                        problemId: problemId,
                        order: td.order,
                        isHidden: td.isHidden,
                        s3Key: `${key}/${td.fileName}`,
                        isSample: td.isSample,
                    }))
                );
            }
        });

        return {
            message: 'Problem created successfully',
            problemId: problemId,
            uploadUrls: uploadUrls,
            uploadContentUrl: await generateUploadURL(key, 'content.md'),
            uploadSolutionUrl: await generateUploadURL(key, 'solution.md'),
        };
    }
    catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('Error creating problem:', error);
        throw new ApiError('Failed to create problem', httpStatus.INTERNAL_SERVER_ERROR);
    }
};

export const handleFinalizeProblem = async (
    userId: string,
    problemId: string
): Promise<IFinalizeProblemResponse> => {
    try {
        // 1. Verify problem existence and authorization
        const problemResult = await db
            .select()
            .from(problem)
            .where(eq(problem.id, problemId));

        if (problemResult.length === 0) {
            throw new ApiError('Problem not found', httpStatus.NOT_FOUND);
        }

        if (problemResult[0].authorId !== userId) {
            throw new ApiError('You do not have permission to finalize this problem', httpStatus.FORBIDDEN);
        }

        // 2. Fetch testcases
        const testcasesResult = await db
            .select()
            .from(testcase)
            .where(eq(testcase.problemId, problemId));

        if (testcasesResult.length === 0) {
            throw new ApiError('No testcases found. Please upload testcases before finalizing.', httpStatus.BAD_REQUEST);
        }

        const sampleTestcases = testcasesResult.filter((tc) => tc.isSample);
        const hiddenTestcases = testcasesResult.filter((tc) => !tc.isSample);

        if (sampleTestcases.length === 0) {
            throw new ApiError('At least one sample testcase is required.', httpStatus.BAD_REQUEST);
        }

        if (hiddenTestcases.length === 0) {
            throw new ApiError('At least one hidden testcase is required.', httpStatus.BAD_REQUEST);
        }

        // 3. Parallel S3 Validation
        await Promise.all(testcasesResult.map(async (tc) => {
            const response = await fetchTestcasesFromS3(tc.s3Key);
            if (!response) {
                throw new ApiError(`Testcase file not found in storage: ${tc.s3Key}`, httpStatus.BAD_REQUEST);
            }
        }));

        const editorialResult = await db
            .select({
                solutionS3Key: editorial.solutionS3Key,
                contentS3Key: editorial.contentS3Key,
            })
            .from(editorial)
            .where(eq(editorial.problemId, problemId))
            .limit(1);

        if (editorialResult.length === 0) {
            throw new ApiError('Editorial not found. Please upload editorial before finalizing.', httpStatus.BAD_REQUEST);
        }

        const editorialData = editorialResult[0];

        const contentResponse = await fetchTestcasesFromS3(editorialData.contentS3Key);
        if (!contentResponse) {
            throw new ApiError('Content file not found in storage: /content.md', httpStatus.BAD_REQUEST);
        }

        const solutionResponse = await fetchTestcasesFromS3(editorialData.solutionS3Key);
        if (!solutionResponse) {
            throw new ApiError('Solution file not found in storage: /solution.md', httpStatus.BAD_REQUEST);
        }

        // 4. Update status to DONE
        await db.update(problem)
            .set({
                status: 'DONE',
            })
            .where(eq(problem.id, problemId));

        return {
            message: 'Problem finalized successfully',
            status: true,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('Error finalizing problem:', error);
        throw new ApiError('Failed to finalize problem', httpStatus.INTERNAL_SERVER_ERROR);
    }
}


export const handleGetProblems = async (
    input: { limit: number, cursor?: string }
): Promise<IGetProblemsResponse> => {
    try {
        let cursorCreatedAt: Date | null = null;
        let cursorId: string | null = null;

        if (input.cursor) {
            try {
                const decoded = Buffer.from(input.cursor, 'base64').toString('utf-8');
                const [timeStr, id] = decoded.split(':');
                cursorCreatedAt = new Date(parseInt(timeStr));
                cursorId = id;
            } catch (e) {
                throw new ApiError('Invalid cursor', httpStatus.BAD_REQUEST);
            }
        }

        const problemsResult = await db
            .select({
                id: problem.id,
                title: problem.title,
                description: problem.description,
                slug: problem.slug,
                difficulty: problem.difficulty,
                createdAt: problem.createdAt,
                updatedAt: problem.updatedAt,
            })
            .from(problem)
            .where(
                and(
                    eq(problem.status, 'DONE'),
                    cursorCreatedAt && cursorId
                        ? or(
                            lt(problem.createdAt, cursorCreatedAt),
                            and(eq(problem.createdAt, cursorCreatedAt), lt(problem.id, cursorId))
                          )
                        : undefined
                )
            )
            .limit(input.limit + 1)
            .orderBy(desc(problem.createdAt), desc(problem.id));

        const hasNextPage = problemsResult.length > input.limit;
        const problems = hasNextPage ? problemsResult.slice(0, input.limit) : problemsResult;

        let nextCursor: string | null = null;
        if (hasNextPage && problems.length > 0) {
            const lastProblem = problems[problems.length - 1];
            const time = lastProblem.createdAt.getTime();
            nextCursor = Buffer.from(`${time}:${lastProblem.id}`).toString('base64');
        }

        if (problems.length === 0) {
            return { problems: [], nextCursor: null };
        }

        const problemIds = problems.map((p) => p.id);

        // Fetch tags for all problems
        const tagsResult = await db
            .select({
                problemId: problemTag.problemId,
                tagName: tag.name,
            })
            .from(problemTag)
            .innerJoin(tag, eq(problemTag.tagId, tag.id))
            .where(inArray(problemTag.problemId, problemIds));


        // Assemble everything
        const assembledProblems = problems.map((p) => {
            const pTags = tagsResult
                .filter((t) => t.problemId === p.id)
                .map((t) => t.tagName);
            return {
                ...p,
                tags: pTags
            } as IProblem;
        });

        return {
            problems: assembledProblems,
            nextCursor,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('Error fetching problems:', error);
        throw new ApiError('Failed to fetch problems', httpStatus.INTERNAL_SERVER_ERROR);
    }
};

export const handleGetProblemById = async (
    problemId: string
): Promise<IAProblem> => {
    try {
        const problemResult = await db
            .select()
            .from(problem)
            .where(
                and(
                    eq(problem.id, problemId),
                    eq(problem.status, 'DONE')
                )
            )
            .limit(1);

        if (problemResult.length === 0) {
            throw new ApiError('Problem not found', httpStatus.NOT_FOUND);
        }

        const p = problemResult[0];

        // Fetch tags
        const tagsResult = await db
            .select({
                tagName: tag.name,
            })
            .from(problemTag)
            .innerJoin(tag, eq(problemTag.tagId, tag.id))
            .where(eq(problemTag.problemId, problemId));

        // Fetch sample testcases
        const testcasesResult = await db
            .select({
                id: testcase.id,
                order: testcase.order,
                s3Key: testcase.s3Key,
            })
            .from(testcase)
            .where(
                and(
                    eq(testcase.problemId, problemId),
                    eq(testcase.isSample, true)
                )
            );

        // Fetch S3 content for sample testcases
        const sampleTestcases = await Promise.all(
            testcasesResult.map(async (tc) => {
                const response = await fetchTestcasesFromS3(tc.s3Key);
                if (!response) {
                    throw new ApiError('Testcase file not found: ' + tc.s3Key, httpStatus.INTERNAL_SERVER_ERROR);
                }
                return {
                    id: tc.id,
                    order: tc.order,
                    input: response.input,
                    output: response.output,
                };
            })
        );

        return {
            ...p,
            difficulty: p.difficulty as any,
            tags: tagsResult.map(t => t.tagName),
            sampleTestcases,
        } as IAProblem;

    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('Error fetching problem by id:', error);
        throw new ApiError('Failed to fetch problem details', httpStatus.INTERNAL_SERVER_ERROR);
    }
};


export const handleGetEditorialSolution = async (
    problemId: string
): Promise<string> => {
    try {
        const editorialResult = await db
            .select()
            .from(editorial)
            .where(eq(editorial.problemId, problemId))
            .limit(1);

        if (editorialResult.length === 0) {
            throw new ApiError('Editorial not found', httpStatus.NOT_FOUND);
        }

        const editorials = editorialResult[0];

        const solutionResponse = await fetchFileFromS3(editorials.solutionS3Key);
        if (!solutionResponse) {
            throw new ApiError('Solution file not found in storage: ' + editorials.solutionS3Key, httpStatus.INTERNAL_SERVER_ERROR);
        }

        return solutionResponse;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('Error fetching editorial solution:', error);
        throw new ApiError('Failed to fetch editorial solution', httpStatus.INTERNAL_SERVER_ERROR);
    }
};


export const handleGetEditorialContent = async (
    problemId: string
): Promise<IProblemEditorialResponse> => {
    try {
        const editorialResult = await db
            .select({
                contentS3Key: editorial.contentS3Key,
                editorialLink: editorial.editorialLink,
            })
            .from(editorial)
            .where(eq(editorial.problemId, problemId))
            .limit(1);
        if (editorialResult.length === 0) {
            throw new ApiError('Editorial not found', httpStatus.NOT_FOUND);
        }
        const editorials = editorialResult[0];
        const editorialContentResponse = await fetchFileFromS3(editorials.contentS3Key);
        if (!editorialContentResponse) {
            throw new ApiError('Editorial content not found in storage: ' + editorials.contentS3Key, httpStatus.INTERNAL_SERVER_ERROR);
        }
        return {
            editorialContent: editorialContentResponse,
            editorialLink: editorials.editorialLink,
        } as IProblemEditorialResponse;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        console.error('Error fetching editorial content:', error);
        throw new ApiError('Failed to fetch editorial content', httpStatus.INTERNAL_SERVER_ERROR);
    }
}
            
            
            