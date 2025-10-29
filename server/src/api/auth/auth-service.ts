// import * as jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';
// import bcrypt from 'bcryptjs';
// import ApiError from '../../utils/apiError';
// import env from '../../config';
// import { UserType, RefreshTokenResponse,GoogleAuthResponse } from './auth-types';
// import { generateTokenPair, validateRefreshToken } from '../../shared/jwt';
// import { verifyGoogleCredentials } from './auth-helper';
// import { db } from '../../loaders/postgres';

// export const hashPassword = async (password: string): Promise<string> => {
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     return hashedPassword;
//   } catch (error) {
//     throw new Error("Error hashing password");
//   }
// };

// export const verifyHashPassword = async (
//     password : string,
//     userPassword : string
// ) : Promise<boolean> => {
//     try {
//         const isPasswordValid = await bcrypt.compare(password, userPassword);
//         return isPasswordValid;
//     }catch(error){
//         throw new Error("Error when checking password");
//     }
// }

// export const handleGoogleOauth = async (req : Request, res : Response) => {
//   const authHeader = req.headers.authorization
//   if (!authHeader) throw new ApiError("Missing Authorization header", httpStatus.UNAUTHORIZED)

//   const token = authHeader.replace("Bearer ", "")
//   const { data: { user }, error } = await supabase.auth.getUser(token)

//   if (error || !user) throw new ApiError("Invalid Supabase token", httpStatus.UNAUTHORIZED)

//   // Check if user already exists in your system
//   const existing = await db
//     .select()
//     .from(authMethodTable)
//     .where(eq(authMethodTable.supabaseId, user.id))
//     .innerJoin(userTable, eq(authMethodTable.userId, userTable.id))

//   let userData
//   let isNewUser = false

//   if (existing.length > 0) {
//     userData = existing[0].user_table
//   } else {
   

//     userData = await db.insert(userTable).values({
//       email: user.email!,
//       name: user.user_metadata?.full_name,
//       subOrgId: "some-generated-org-id",
//       type: "user",
//     }).returning()

//     await db.insert(authMethodTable).values({
//       userId: userData[0].id,
//       supabaseId: user.id,
//       provider: "google",
//     })
//     isNewUser = true
//   }

//   const { accessToken, refreshToken } = generateTokenPair({
//     userId: userData[0].id,
//     userType: userData[0].type,
//   })

//   res.cookie("access_token", accessToken, { httpOnly: true, secure: true })
//   res.cookie("refresh_token", refreshToken, { httpOnly: true, secure: true })

//   return res.json({
//     isNewUser,
//     userId: userData[0].id,
//     accessToken,
//     refreshToken,
//   })
// }

