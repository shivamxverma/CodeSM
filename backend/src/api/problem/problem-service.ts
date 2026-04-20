import { ICreateProblemRequest, ICreateProblemResponse, IFinalizeProblemResponse } from "./problem-types";
import { verifyProblemCreationPermission } from './problem-helper';
import { db } from '../../loaders/postgres';
import { problem, editorial, tag, problemTags,testcases } from '../../db/schema';
import { eq } from 'drizzle-orm';
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import { generateUploadURL, fetchTestcasesFromS3 } from '../../services/aws.service';
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
                content: input.editorialContent,
                editorialLink: input.editorialLink,
                solution: input.solution,
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
                    await tx.insert(problemTags).values(
                        tagIds.map(tagId => ({
                            problemId: problemId,
                            tagId: tagId,
                        }))
                    ).onConflictDoNothing();
                }
            }

            // D. Bulk insert all testcase records
            if (allTestData.length > 0) {
                await tx.insert(testcases).values(
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
            uploadUrls: uploadUrls
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

export const handleFinializeProblem = async (
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
            .from(testcases)
            .where(eq(testcases.problemId, problemId));

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
    