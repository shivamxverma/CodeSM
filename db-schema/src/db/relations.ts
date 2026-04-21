import { relations } from 'drizzle-orm';
import { user, problem, tag,problemTag, session, testcase, hint, editorial, submission, executionResult } from './schema';

export const userRelations = relations(user, ({ many }) => ({
    problem: many(problem),
    submission: many(submission),
    session: many(session),
}));

export const problemRelations = relations(problem, ({ many }) => ({
    testcase: many(testcase),
    hint: many(hint),
    editorial: many(editorial),
}));

export const submissionRelations = relations(submission, ({ one }) => ({
    problem: one(problem, {
        fields: [submission.problemId],
        references: [problem.id],
    }),
    user: one(user, {
        fields: [submission.userId],
        references: [user.id],
    }),
}));

export const executionResultRelations = relations(executionResult, ({ one }) => ({
    submission: one(submission, {
        fields: [executionResult.submissionId],
        references: [submission.id],
    }),
}));

export const testcaseRelations = relations(testcase, ({ one }) => ({
    problem: one(problem, {
        fields: [testcase.problemId],
        references: [problem.id],
    }),
}));

export const hintRelations = relations(hint, ({ one }) => ({
    problem: one(problem, {
        fields: [hint.problemId],
        references: [problem.id],
    }),
}));

export const editorialRelations = relations(editorial, ({ one }) => ({
    problem: one(problem, {
        fields: [editorial.problemId],
        references: [problem.id],
    }),
}));

export const problemTagsRelations = relations(problemTag, ({ one }) => ({
    problem: one(problem, {
        fields: [problemTag.problemId],
        references: [problem.id],
    }),
    tag: one(tag, {
        fields: [problemTag.tagId],
        references: [tag.id],
    })
}));

export const tagRelations = relations(tag, ({ many }) => ({
    problems: many(problemTag),
}));