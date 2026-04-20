import { db } from '../../loaders/postgres';
import { user } from '../../db/schema';
import { eq } from 'drizzle-orm';

export const verifyProblemCreationPermission = async (userId : string) => {
    const users = await db.select().from(user).where(eq(user.id, userId));
    if(users.length === 0) {
        throw new Error('User not found');
    }
    if(users[0].role !== 'ADMIN' && users[0].role !== 'AUTHOR') {
        throw new Error('You do not have permission to create problems');
    }
}