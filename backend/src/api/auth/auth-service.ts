import { EmailPasswordRegisterRequest, RegisterResponse, EmailPasswordLoginRequest } from './auth-types';
import { db } from '../../loaders/postgres';
import {
    authMethod as authMethodTable,
    user as userTable
} from '../../db/schema';
import { eq,and } from 'drizzle-orm';
import ApiError from 'src/utils/ApiError';
import { hashPassword, comparePassword } from './auth-helper';
import httpStatus from 'http-status';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '../emails/email-service';
import logger from '../../loaders/logger';
import { sendOnboardingWelcomeEmail } from '../emails/emails/onboarding';
import {generateTokenPair} from '../../shared/jwt';

export const handleEmailPasswordRegister = async (
    data: EmailPasswordRegisterRequest
): Promise<RegisterResponse> => {
    const { email, password, username } = data;

    try {
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

        await db.transaction(async (tx) => {
            await tx
                .insert(userTable)
                .values({
                    id: newUserId,
                    updatedAt: new Date().toISOString(),
                    email,
                    displayName: username,
                    username,
                    isEmailVerified: false,
                    verificationToken: verificationToken,
                })
                .returning({ id: userTable.id });

            await tx.insert(authMethodTable).values({
                id: uuidv4(),
                updatedAt: new Date().toISOString(),
                userId: newUserId,
                provider: 'EMAIL_PASSWORD',
                email,
                passwordHash,
            });
        });

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        logger.info('User registered, verification email sent:', newUserId);

        return {
            success: true,
            message: 'Registration successful. Please check your email to verify your account.',
        };
    }
    catch (error) {
        if (error instanceof ApiError) throw error;

        logger.error('Database error during email/password registration:', error);
        throw new ApiError(
            'Failed to create user account. Please try again later.',
            httpStatus.SERVICE_UNAVAILABLE,
        );
    }
};

export const verifyEmail = async (token: string): Promise<void> => {
    try {
        if (!db) {
            throw new ApiError('Database not available', httpStatus.SERVICE_UNAVAILABLE);
        }

        const users = await db
            .select()
            .from(userTable)
            .where(eq(userTable.verificationToken, token));

        if (users.length === 0) {
            throw new ApiError('Invalid or expired verification token', httpStatus.BAD_REQUEST);
        }

        const user = users[0];

        await db
            .update(userTable)
            .set({
                isEmailVerified: true,
                verificationToken: null
            })
            .where(eq(userTable.id, user.id));

        if (user.email) {
            await sendOnboardingWelcomeEmail(
                user.email,
                {
                    name: user.displayName || 'User',
                    heroImageUrl: user.avatarUrl || undefined,
                }
            ).catch((error: any) => {
                logger.error('Failed to send onboarding email after verification:', error);
            });
        }


    } catch (error) {
        if (error instanceof ApiError) throw error;
        logger.error('Error verifying email:', error);
        throw new ApiError(
            'Failed to verify email. Please try again later.',
            httpStatus.SERVICE_UNAVAILABLE,
        );
    }
}

export const handleEmailPasswordLogin = async(data : EmailPasswordLoginRequest) => {
    const {email, password} = data;

    try {
        const results = await db
            .select({
                id : userTable.id,
                isEmailVerified : userTable.isEmailVerified,
                passwordHash : authMethodTable.passwordHash
            })
            .from(userTable)
            .innerJoin(
                authMethodTable,
                eq(authMethodTable.userId,userTable.id)
            )
            .where(
                and(eq(userTable.email, email),
                eq(authMethodTable.provider, 'EMAIL_PASSWORD'))

            )
            .limit(1)

            
        const result = results[0];
            
        if(!results){
            throw new ApiError('Invalid credentials', httpStatus.UNAUTHORIZED);
        }

        if(!result.isEmailVerified){
            throw new ApiError('Please verify your email first', httpStatus.UNAUTHORIZED);
        }

        if (!result.passwordHash) {
            throw new ApiError("Invalid credentials", httpStatus.UNAUTHORIZED);
        }

        const isPasswordValid = await comparePassword(password, result.passwordHash!);

        if(!isPasswordValid) {
            throw new ApiError("Invalid credentials", httpStatus.UNAUTHORIZED);
        }

        const tokenPayload = {
            userId: result.id,
            lastLogin: new Date(),
        };

        const { accessToken, refreshToken } = generateTokenPair(tokenPayload);

        logger.info('User logged in with email/password:', result.id);

        return {
            isNewUser: false,
            userId: result.id,
            accessToken: accessToken!,
            refreshToken: refreshToken!,
        };
    } catch(error) {
        if (error instanceof ApiError) throw error;
        logger.error('Error Email login:', error);
        throw new ApiError(
            'Failed to login. Please try again later.',
            httpStatus.SERVICE_UNAVAILABLE,
        );
    }
}
