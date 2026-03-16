import {
  pgTable,
  pgEnum,
  bigserial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  primaryKey,
  index,
  uniqueIndex
} from "drizzle-orm/pg-core"

/* =========================
ENUMS
========================= */

export const roleEnum = pgEnum("role", ["ADMIN","AUTHOR","USER"])

export const jobStatusEnum = pgEnum("job_status", [
  "PENDING",
  "RUNNING",
  "FAILED",
  "COMPLETED"
])

export const verdictEnum = pgEnum("verdict", [
  "ACCEPTED",
  "WRONG_ANSWER",
  "TIME_LIMIT_EXCEEDED",
  "MEMORY_LIMIT_EXCEEDED",
  "RUNTIME_ERROR",
  "COMPILE_ERROR"
])

export const visibilityEnum = pgEnum("visibility", [
  "PUBLIC",
  "PRIVATE",
  "ONE_VS_ONE"
])

export const submissionSourceEnum = pgEnum("submission_source", [
  "PRACTICE",
  "CONTEST",
  "INTERVIEW"
])

export const interviewStatusEnum = pgEnum("interview_status", [
  "SCHEDULED",
  "RUNNING",
  "COMPLETED"
])

export const interviewerTypeEnum = pgEnum("interviewer_type", [
  "AI",
  "HUMAN"
])

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "ACTIVE",
  "EXPIRED",
  "CANCELLED"
])


/* =========================
USERS
========================= */

export const users = pgTable(
  "users",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    username: varchar("username", { length: 50 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash"),
    role: roleEnum("role").default("USER"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
  },
  (t) => ({
    usernameIdx: uniqueIndex("users_username_idx").on(t.username),
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
    googleIdx: index("users_google_idx").on(t.googleId)
  })
)

/* =========================
SESSIONS
========================= */

export const sessions = pgTable(
  "sessions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
    googleId: varchar("google_id", { length: 255 }),
    refreshToken: text("refresh_token").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow()
  },
  (t) => ({
    userIdx: index("sessions_user_idx").on(t.userId)
  })
)


/* =========================
PROBLEMS
========================= */

export const problems = pgTable(
  "problems",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    title: text("title").notNull(),
    slug: text("slug"),
    difficulty: varchar("difficulty", { length: 20 }),
    description: text("description"),
    memoryLimitMb: integer("memory_limit_mb"),
    timeLimitMs: integer("time_limit_ms"),
    inputFormat: text("input_format"),
    outputFormat: text("output_format"),
    visibility: visibilityEnum("visibility").default("PUBLIC"),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow()
  },
  (t) => ({
    slugIdx: uniqueIndex("problems_slug_idx").on(t.slug),
    authorIdx: index("problems_author_idx").on(t.createdBy)
  })
)


/* =========================
TAGS
========================= */

export const tags = pgTable(
  "tags",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 50 }).notNull()
  },
  (t) => ({
    nameIdx: uniqueIndex("tags_name_idx").on(t.name)
  })
)


export const problemTags = pgTable(
  "problem_tags",
  {
    problemId: integer("problem_id").references(() => problems.id, { onDelete: "cascade" }),
    tagId: integer("tag_id").references(() => tags.id, { onDelete: "cascade" })
  },
  (t) => ({
    pk: primaryKey({ columns: [t.problemId, t.tagId] }),
    tagIdx: index("problem_tags_tag_idx").on(t.tagId)
  })
)


/* =========================
EDITORIALS
========================= */

export const editorials = pgTable(
  "editorials",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    problemId: integer("problem_id").references(() => problems.id, { onDelete: "cascade" }),
    videoUrl: text("video_url"),
    content: text("content"),
    solution: text("solution"),
    editorialLink: text("editorial_link"),
    createdAt: timestamp("created_at").defaultNow()
  },
  (t) => ({
    problemIdx: index("editorials_problem_idx").on(t.problemId)
  })
)


/* =========================
TESTCASES
========================= */

export const testcases = pgTable(
  "testcases",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    problemId: integer("problem_id").references(() => problems.id, { onDelete: "cascade" }),
    inputPath: text("input_path").notNull(),
    outputPath: text("output_path").notNull(),
    isSample: boolean("is_sample").default(false),
    points: integer("points").default(0),
    createdAt: timestamp("created_at").defaultNow()
  },
  (t) => ({
    problemIdx: index("testcases_problem_idx").on(t.problemId)
  })
)


/* =========================
LANGUAGES
========================= */

export const languages = pgTable(
  "languages",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 50 }),
    version: varchar("version", { length: 50 }),
    dockerImage: text("docker_image"),
    compileCommand: text("compile_command"),
    runCommand: text("run_command")
  },
  (t) => ({
    nameIdx: index("languages_name_idx").on(t.name)
  })
)


/* =========================
SUBMISSIONS
========================= */

export const submissions = pgTable(
  "submissions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: integer("user_id").references(() => users.id),
    problemId: integer("problem_id").references(() => problems.id),
    languageId: integer("language_id").references(() => languages.id),
    code: text("code").notNull(),
    status: jobStatusEnum("status").default("PENDING"),
    source: submissionSourceEnum("source").default("PRACTICE"),
    createdAt: timestamp("created_at").defaultNow()
  },
  (t) => ({
    userIdx: index("submissions_user_idx").on(t.userId),
    problemIdx: index("submissions_problem_idx").on(t.problemId),
    statusIdx: index("submissions_status_idx").on(t.status)
  })
)


/* =========================
EXECUTION RESULTS
========================= */

export const executionResults = pgTable(
  "execution_results",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    submissionId: integer("submission_id").references(() => submissions.id, { onDelete: "cascade" }),
    verdict: verdictEnum("verdict"),
    executionTimeMs: integer("execution_time_ms"),
    memoryUsedKb: integer("memory_used_kb"),
    stdout: text("stdout"),
    stderr: text("stderr"),
    createdAt: timestamp("created_at").defaultNow()
  },
  (t) => ({
    submissionIdx: index("execution_results_submission_idx").on(t.submissionId)
  })
)


/* =========================
CONTESTS
========================= */

export const contests = pgTable(
  "contests",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    title: text("title"),
    description: text("description"),
    visibility: visibilityEnum("visibility"),
    authorId: integer("author_id").references(() => users.id),
    startTime: timestamp("start_time"),
    endTime: timestamp("end_time"),
    createdAt: timestamp("created_at").defaultNow()
  },
  (t) => ({
    authorIdx: index("contests_author_idx").on(t.authorId)
  })
)


/* =========================
INTERVIEW SESSIONS
========================= */

export const interviewSessions = pgTable(
  "interview_sessions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    candidateId: integer("candidate_id").references(() => users.id),
    interviewerId: integer("interviewer_id").references(() => users.id),
    interviewerType: interviewerTypeEnum("interviewer_type").default("AI"),
    role: text("role"),
    experienceLevel: text("experience_level"),
    status: interviewStatusEnum("status").default("SCHEDULED"),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at")
  },
  (t) => ({
    candidateIdx: index("interview_candidate_idx").on(t.candidateId)
  })
)


/* =========================
SUBSCRIPTIONS
========================= */

export const plans = pgTable("plans", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: varchar("name", { length: 50 }),
  monthlyPrice: integer("monthly_price"),
  creditCycle: integer("credit_cycle"),
  trialCredits: integer("trial_credits"),
  trialPeriodDays: integer("trial_period_days"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
})


export const userSubscriptions = pgTable(
  "user_subscriptions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: integer("user_id").references(() => users.id),
    planId: integer("plan_id").references(() => plans.id),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    status: subscriptionStatusEnum("status")
  },
  (t) => ({
    userIdx: index("user_subscriptions_user_idx").on(t.userId)
  })
)


/* =========================
EXECUTION PIPELINE
========================= */

export const jobs = pgTable(
  "jobs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    submissionId: integer("submission_id").references(() => submissions.id),
    status: jobStatusEnum("status").default("PENDING"),
    priority: integer("priority").default(0),
    scheduledAt: timestamp("scheduled_at"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow()
  },
  (t) => ({
    submissionIdx: index("jobs_submission_idx").on(t.submissionId),
    statusIdx: index("jobs_status_idx").on(t.status)
  })
)


export const jobAttempts = pgTable(
  "job_attempts",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    jobId: integer("job_id").references(() => jobs.id, { onDelete: "cascade" }),
    workerId: integer("worker_id"),
    status: jobStatusEnum("status"),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at"),
    finishedAt: timestamp("finished_at")
  },
  (t) => ({
    jobIdx: index("job_attempts_job_idx").on(t.jobId)
  })
)


export const workers = pgTable(
  "workers",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    hostname: text("hostname"),
    status: varchar("status", { length: 20 }),
    capacity: integer("capacity"),
    lastHeartbeat: timestamp("last_heartbeat"),
    createdAt: timestamp("created_at").defaultNow()
  }
)


export const workerHeartbeats = pgTable(
  "worker_heartbeats",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    workerId: integer("worker_id").references(() => workers.id, { onDelete: "cascade" }),
    cpuUsage: integer("cpu_usage"),
    memoryUsage: integer("memory_usage"),
    recordedAt: timestamp("recorded_at").defaultNow()
  },
  (t) => ({
    workerIdx: index("worker_heartbeats_worker_idx").on(t.workerId)
  })
)


export const jobLogs = pgTable(
  "job_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    jobId: integer("job_id").references(() => jobs.id),
    level: varchar("level", { length: 20 }),
    message: text("message"),
    createdAt: timestamp("created_at").defaultNow()
  },
  (t) => ({
    jobIdx: index("job_logs_job_idx").on(t.jobId)
  })
)