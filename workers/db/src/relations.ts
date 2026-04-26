import { relations } from 'drizzle-orm';
import { user, problem, tag,problemTag, session, testcase, hint, editorial, submission, executionResult } from './schema.ts';

export const userRelations = relations(user, ({ many }: { many: any }) => ({
    problem: many(problem),
    submission: many(submission),
    session: many(session),
}));

export const problemRelations = relations(problem, ({ many }: { many: any }) => ({
    testcase: many(testcase),
    hint: many(hint),
    editorial: many(editorial),
}));

export const submissionRelations = relations(submission, ({ one }: { one: any }) => ({
    problem: one(problem, {
        fields: [submission.problemId],
        references: [problem.id],
    }),
    user: one(user, {
        fields: [submission.userId],
        references: [user.id],
    }),
}));

export const executionResultRelations = relations(executionResult, ({ one }: { one: any }) => ({
    submission: one(submission, {
        fields: [executionResult.submissionId],
        references: [submission.id],
    }),
}));

export const testcaseRelations = relations(testcase, ({ one }: { one: any }) => ({
    problem: one(problem, {
        fields: [testcase.problemId],
        references: [problem.id],
    }),
}));

export const hintRelations = relations(hint, ({ one } : { one : any}) => ({
    problem: one(problem, {
        fields: [hint.problemId],
        references: [problem.id],
    }),
}));

export const editorialRelations = relations(editorial, ({ one } : { one : any}) => ({
    problem: one(problem, {
        fields: [editorial.problemId],
        references: [problem.id],
    }),
}));

export const problemTagsRelations = relations(problemTag, ({ one } : { one : any}) => ({
    problem: one(problem, {
        fields: [problemTag.problemId],
        references: [problem.id],
    }),
    tag: one(tag, {
        fields: [problemTag.tagId],
        references: [tag.id],
    })
}));

export const tagRelations = relations(tag, ({ many } : { many : any}) => ({
    problems: many(problemTag),
}));