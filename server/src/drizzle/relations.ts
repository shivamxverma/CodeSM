import { relations } from 'drizzle-orm/relations';
import { users, problems , tag} from './schema';


export const AuthorCreatedProblems = relations(users, ({ many }) => ({
  problems: many(problems),
}));

export const ProblemsHaveTags = relations(problems,({many}) => ({
  tags : many(tag)
}))

