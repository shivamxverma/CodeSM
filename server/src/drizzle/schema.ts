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

export const userType = pgEnum('UserType', [
    'AUTHOR',
    'USER',
    'ADMIN',
]);

export const userStatus = pgEnum('UserStatus', ['ACTIVE', 'INACTIVE']);

export const users = pgTable(
  'users',
  {
    id: uuid().defaultRandom().primaryKey().notNull(),

    supabaseUserId: uuid('supabase_user_id').notNull().unique(),
    email: text(),
    displayName: text('display_name').notNull(),
    username: text('username'),
    avatarUrl: text('avatar_url'),

    status: userStatus().default('ACTIVE').notNull(),
    type: userType().default('USER').notNull(),
    role: text('role').default('user').notNull(),

    emailVerified: boolean('email_verified').default(false).notNull(),
    isBanned: boolean('is_banned').default(false).notNull(),

    lastLoginAt: timestamp('last_login_at', { precision: 3, mode: 'string' }),

    createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
      .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
      .notNull(),
    updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
      .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
      .notNull(),

    Allproblems: uuid('problemId').references(() : any => problems.id).notNull(),
  },
  (table) => [
    index('user_status_idx').using('btree', table.status.asc().nullsLast()),
  ]
);


export const tag = pgTable('tag', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
        .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
        .notNull(),
});

export const problems = pgTable(
  'problems',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    title: varchar('title', { length: 255 }).notNull().unique(),
    difficulty: integer('difficulty').notNull(),
    authorId : uuid('author_id').notNull().references(() => users.id,{ onDelete: "cascade" }),
    problemdata : text('problemdata'),
    tags : uuid('tag_id').references(() => tag.id).notNull(),
    solutions : varchar('editorial',{length:255}).notNull().unique(),
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