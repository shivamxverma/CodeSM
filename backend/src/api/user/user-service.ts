import {EmailPasswordRegisterRequest, RegisterResponse} from './user-types';
import { db } from '../../loaders/postgres';
import {
    authMethod as authMethodTable,
    user as userTable
} from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import ApiError from 'src/utils/ApiError';
import { hashPassword } from './user-helper';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';

export const handleEmailPasswordRegister = async(
    data : EmailPasswordRegisterRequest
) : Promise<RegisterResponse> => {
    const { email , password , username} = data;

    if (!db) {
        throw new ApiError('Database not available', httpStatus.SERVICE_UNAVAILABLE);
    }

    const existingByEmail = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email));

    if (existingByEmail.length > 0) {
        throw new ApiError(
            'An account with this email already exists',
            httpStatus.CONFLICT
        );
    }

    const existingByUsername = await db
        .select()
        .from(userTable)
        .where(eq(userTable.username, username));

    if (existingByUsername.length > 0) {
        throw new ApiError(
            'This username is already taken',
            httpStatus.CONFLICT
        );
    }

    const passwordHash = await hashPassword(password);
    const verificationToken = uuidv4();
    const newUserId = uuidv4();

    const [newUser] = await db
        .insert(userTable)
        .values({
            id : newUserId,
            updatedAt: new Date().toISOString(),
            email,
            displayName: username,
            username,
            isEmailVerified: false,
            verificationToken: verificationToken,
        })
        .returning({ id: userTable.id });

    await db.insert(authMethodTable).values({
        id : uuidv4(),
        updatedAt: new Date().toISOString(),
        userId: newUser.id,
        provider: 'EMAIL_PASSWORD',
        email,
        passwordHash,
    });

    return {
        success: true,
        message: 'Registration successful',
    };
};
