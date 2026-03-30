import {
    pgTable,
    text,
    timestamp,
    integer,
    smallint,
    boolean,
    index,
    uniqueIndex,
    foreignKey,
    pgEnum,
    primaryKey,
} from 'drizzle-orm/pg-core';
import type { ExtraConfigColumn } from 'drizzle-orm/pg-core/columns/common';
import { sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export const roleEnum = pgEnum('role', ['ADMIN', 'AUTHOR', 'USER']);

// FIX: Removed duplicate 'EMAIL' — 'EMAIL_PASSWORD' is the correct and only email provider value
export const authProvider = pgEnum('AuthProvider', [
    'GOOGLE_OAUTH',
    'EMAIL_PASSWORD',
]);

export const languageEnum = pgEnum('Language', [
    'CPP',
    'JAVA',
    'PYTHON',
    'JAVASCRIPT',
    'C',
    'CSHARP',
]);

export const jobStatusEnum = pgEnum('JobStatus', [
    'PENDING',
    'RUNNING',
    'FAILED',
    'COMPLETED',
]);

export const verdictEnum = pgEnum('Verdict', [
    'PENDING',
    'ACCEPTED',
    'WRONG_ANSWER',
    'TIME_LIMIT_EXCEEDED',
    'MEMORY_LIMIT_EXCEEDED',
    'RUNTIME_ERROR',
    'COMPILE_ERROR',
]);


export const difficultyEnum = pgEnum('Difficulty', [
    'EASY',     // ~800–1200
    'MEDIUM',   // ~1200–2000
    'HARD',     // ~2000–2500
    'EXPERT',   // ~2500+
]);

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

export const user = pgTable(
    'user',
    {
        id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
        email: text('email'),
        displayName: text('display_name'),
        avatarUrl: text('avatar_url'),
        username: text('username').notNull(),
        role: roleEnum('role').notNull().default('USER'),
        is2FaAuthEnabled: boolean('is2fa_auth_enabled').default(false).notNull(),
        isBanned: boolean('is_banned').default(false).notNull(),
        isEmailVerified: boolean('is_email_verified').default(false).notNull(),
        verificationToken: text('verification_token'),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
    },
    (table: any) => [
        uniqueIndex('user_email_key').using('btree', table.email.asc().nullsLast()),
        uniqueIndex('user_username_key').using('btree', table.username.asc().nullsLast()),
    ],
);

// ─────────────────────────────────────────────
// Auth Method
// ─────────────────────────────────────────────

const authMethodColumns = {
    id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
    userId: text('user_id').notNull(),
    provider: authProvider('provider').notNull(),
    // Google OAuth fields
    googleSub: text('google_sub'),
    googleEmail: text('google_email'),
    // Email/password fields
    email: text('email'),
    passwordHash: text('password_hash'),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
        .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
        .notNull(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
        .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
        .notNull(),
};

type AuthMethodIndexColumns = {
    [K in keyof typeof authMethodColumns]: ExtraConfigColumn;
};

export const authMethod = pgTable(
    'auth_method',
    authMethodColumns,
    (table: AuthMethodIndexColumns) => [
        uniqueIndex('auth_method_google_email_key').using('btree', table.googleEmail.asc().nullsLast()),
        uniqueIndex('auth_method_google_sub_key').using('btree', table.googleSub.asc().nullsLast()),
        index('auth_method_provider_idx').using('btree', table.provider.asc().nullsLast()),
        // One auth method per user (1:1 relationship)
        uniqueIndex('auth_method_user_id_key').using('btree', table.userId.asc().nullsLast()),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: 'auth_method_user_id_fkey',
        })
            .onUpdate('cascade')
            .onDelete('cascade'),
    ],
);

// ─────────────────────────────────────────────
// Session
// ─────────────────────────────────────────────

export const session = pgTable(
    'session',
    {
        id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
        // userId is notNull — a session must belong to a user
        userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        sessionToken: text('session_token').notNull(),
        expires: timestamp('expires', { precision: 3, mode: 'string' }).notNull(),
    },
    (table: any) => [
        index('session_user_id_idx').using('btree', table.userId.asc().nullsLast()),
    ],
);

// ─────────────────────────────────────────────
// Problem
// ─────────────────────────────────────────────

export const problem = pgTable(
    'problem',
    {
        id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
        title: text('title').notNull(),
        // FIX: Use difficultyEnum instead of a magic smallint.
        // If you want numeric Codeforces-style ratings, keep smallint but document
        // the range and consider a check constraint at the DB level.
        difficulty: difficultyEnum('difficulty').notNull().default('EASY'),
        description: text('description').notNull(),
        // FIX: onDelete is now 'restrict' — deleting a user should NOT silently delete all their problems.
        // Use 'cascade' only if that's genuinely what you want (it usually isn't for authored content).
        authorId: text('author_id').notNull().references(() => user.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
        isPublished: boolean('is_published').default(false).notNull(),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
    },
    (table: any) => [
        index('problem_author_id_idx').using('btree', table.authorId.asc().nullsLast()),
        index('problem_title_idx').using('btree', table.title.asc().nullsLast()),
        index('problem_difficulty_idx').using('btree', table.difficulty.asc().nullsLast()),
        index('problem_created_at_idx').using('btree', table.createdAt.asc().nullsLast()),
        // FIX: Removed problem_updated_at_idx — updated_at indexes almost never get used
        // and add write overhead on every update.
    ],
);

// ─────────────────────────────────────────────
// Tag
// ─────────────────────────────────────────────

const tagColumns = {
    id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
    name: text('name').notNull(),
};

type TagIndexColumns = {
    [K in keyof typeof tagColumns]: ExtraConfigColumn;
};

export const tag = pgTable(
    'tag',
    tagColumns,
    (table: TagIndexColumns) => [
        uniqueIndex('tag_name_key').using('btree', table.name.asc().nullsLast()),
    ],
);

// ─────────────────────────────────────────────
// Problem Tags (junction table)
// ─────────────────────────────────────────────

export const problemTags = pgTable(
    'problem_tags',
    {
        problemId: text('problem_id').notNull().references(() => problem.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        tagId: text('tag_id').notNull().references(() => tag.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    },
    // FIX: Composite PK prevents duplicate (problemId, tagId) pairs
    (table: any) => [
        primaryKey({ columns: [table.problemId, table.tagId] }),
    ],
);

// ─────────────────────────────────────────────
// Testcases
// ─────────────────────────────────────────────

export const testcases = pgTable(
    'testcases',
    {
        id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
        problemId: text('problem_id').notNull().references(() => problem.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        input: text('input'),
        output: text('output'),
        // FIX: Column name changed from 'isSample' to 'is_sample' to match snake_case convention
        isSample: boolean('is_sample').default(false).notNull(),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
    },
    (table: any) => [
        index('testcases_problem_id_idx').using('btree', table.problemId.asc().nullsLast()),
        // FIX: Added is_sample index — filtering sample test cases is a very common operation
        index('testcases_is_sample_idx').using('btree', table.isSample.asc().nullsLast()),
    ],
);

// ─────────────────────────────────────────────
// Hints
// ─────────────────────────────────────────────

export const hints = pgTable(
    'hints',
    {
        id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
        problemId: text('problem_id').notNull().references(() => problem.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        // FIX: Added ordering so hints can be revealed progressively (hint 1 before hint 2)
        order: smallint('order').notNull().default(0),
        title: text('title').notNull(),
        content: text('content').notNull(),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
    },
    (table: any) => [
        index('hints_problem_id_idx').using('btree', table.problemId.asc().nullsLast()),
    ],
);

// ─────────────────────────────────────────────
// Editorial
// FIX: Export name lowercased from 'Editorial' to 'editorial' — consistent with all other exports
// ─────────────────────────────────────────────

export const editorial = pgTable(
    'editorial',
    {
        id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
        problemId: text('problem_id').notNull().references(() => problem.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        content: text('content').notNull(),
        editorialLink: text('editorial_link'),
        solution: text('solution'),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
    },
    (table: any) => [
        // FIX: uniqueIndex instead of plain index — one editorial per problem
        uniqueIndex('editorial_problem_id_key').using('btree', table.problemId.asc().nullsLast()),
    ],
);

// ─────────────────────────────────────────────
// Submission
// ─────────────────────────────────────────────

export const submission = pgTable(
    'submission',
    {
        id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
        problemId: text('problem_id').notNull().references(() => problem.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        code: text('code').notNull(),
        language: languageEnum('language').notNull().default('CPP'),
        status: jobStatusEnum('status').notNull().default('PENDING'),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
    },
    (table: any) => [
        // FIX: Added composite index — the most common query is "all submissions by user X for problem Y"
        index('submission_user_problem_idx').using('btree', table.userId.asc(), table.problemId.asc()),
        index('submission_problem_id_idx').using('btree', table.problemId.asc().nullsLast()),
        index('submission_user_id_idx').using('btree', table.userId.asc().nullsLast()),
        index('submission_status_idx').using('btree', table.status.asc().nullsLast()),
        index('submission_created_at_idx').using('btree', table.createdAt.asc().nullsLast()),
        // FIX: Removed submission_language_idx and submission_updated_at_idx —
        // language filtering is rare and updatedAt indexes add overhead with no real query benefit.
    ],
);

// ─────────────────────────────────────────────
// Execution Result
// ─────────────────────────────────────────────

export const executionResult = pgTable(
    'execution_result',
    {
        id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
        submissionId: text('submission_id').notNull().references(() => submission.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        testcaseId: text('testcase_id').notNull().references(() => testcases.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        verdict: verdictEnum('verdict').notNull().default('PENDING'),
        executionTimeMs: integer('execution_time_ms'),
        memoryUsedKb: integer('memory_used_kb'),
        stdout: text('stdout'),
        stderr: text('stderr'),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
    },
    (table: any) => [
        // FIX: Added composite index — verdict is almost always queried alongside submissionId
        index('execution_result_submission_verdict_idx').using('btree', table.submissionId.asc(), table.verdict.asc()),
        index('execution_result_submission_id_idx').using('btree', table.submissionId.asc().nullsLast()),
        index('execution_result_testcase_id_idx').using('btree', table.testcaseId.asc().nullsLast()),
        // FIX: Removed execution_result_created_at_idx and execution_result_updated_at_idx —
        // not queried by time in any typical judge workflow.
    ],
);