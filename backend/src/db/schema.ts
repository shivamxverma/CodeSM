import {
    pgTable,
    uniqueIndex,
    index,
    timestamp,
    uuid,
    text,
    boolean,
    integer,
    foreignKey,
    bigint,
    json,
    doublePrecision,
    numeric,
    varchar,
    pgEnum,
} from 'drizzle-orm/pg-core';

import { sql } from 'drizzle-orm';
import { title } from 'process';


export const userType = pgEnum('UserType', [
    'Author',
    'User',
    'Admin',
]);

export const userStatus = pgEnum('UserStatus', ['ACTIVE', 'INACTIVE']);

export const users = pgTable(
    'users',
    {
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        isBanned: boolean('is_banned').default(false).notNull(),
        id: uuid().defaultRandom().primaryKey().notNull(),
        email: text(),
        displayName: text('display_name').notNull(),
        avatarUrl: text('avatar_url'),
        status: userStatus().default('ACTIVE').notNull(),
        type: userType().default('User').notNull(),
        username: text('username'),
  },
    (table) => [
        index('user_status_idx').using('btree', table.status.asc().nullsLast())
    ]
);

export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
        .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
        .notNull(),
});

export const editorials = pgTable('editorials', {
  id: uuid('id').defaultRandom().primaryKey(),
  problemId: uuid('problem_id').notNull().unique(),
  content: text('content'),
  videoLink: varchar('video_link', { length: 255 }),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
        .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
        .notNull(),
});

export const problems = pgTable(
  'problems',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull().unique(),
    difficulty: integer('difficulty').notNull(),
    description: text('description').notNull(),
    memoryLimit: integer('memory_limit').notNull(),
    timeLimit: integer('time_limit').notNull(),
    inputFormat: text('input_format').notNull(),
    outputFormat: text('output_format').notNull(),
    constraints: text('constraints').notNull(),
    authorId: uuid('author_id').references(() => users.id).notNull(),
    editorialId: uuid('editorial_id'),
    solutionFile: varchar('solution_file', { length: 255 }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
  },
  (table) => ({
    difficultyIdx: index('difficulty_idx').on(table.difficulty),
    titleIdx: index('title_idx').on(table.title),
    authorIdx: index('author_idx').on(table.authorId),
  }),
);