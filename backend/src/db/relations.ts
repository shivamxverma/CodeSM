import { relations } from 'drizzle-orm';
import { user, problem, tag,problemTags, session, testcases, hints, editorial, submission, executionResult } from './schema';

export const userRelations = relations(user, ({ many }: { many: any }) => ({
    problems: many(problem),
    submissions: many(submission),
    sessions: many(session),
}));

export const problemRelations = relations(problem, ({ many }: { many: any }) => ({
    testcases: many(testcases),
    hints: many(hints),
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

export const testcaseRelations = relations(testcases, ({ one }: { one: any }) => ({
    problem: one(problem, {
        fields: [testcases.problemId],
        references: [problem.id],
    }),
}));

export const hintRelations = relations(hints, ({ one } : { one : any}) => ({
    problem: one(problem, {
        fields: [hints.problemId],
        references: [problem.id],
    }),
}));

export const editorialRelations = relations(editorial, ({ one } : { one : any}) => ({
    problem: one(problem, {
        fields: [editorial.problemId],
        references: [problem.id],
    }),
}));

export const problemTagsRelations = relations(problemTags, ({ one } : { one : any}) => ({
    problem: one(problem, {
        fields: [problemTags.problemId],
        references: [problem.id],
    }),
}));