// src/config/passport.config.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import env from './index.js';

passport.use(new GoogleStrategy({
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    callbackURL: env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const googleEmail = profile.emails?.[0]?.value?.toLowerCase();
         
        console.log("shivam here",env.GOOGLE_CALLBACK_URL);
        // 1. Already linked via googleId
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
            // 2. Same email exists — link googleId to that account
            user = await User.findOne({ email: googleEmail });

            if (user) {
                user.googleId = profile.id;
                await user.save({ validateBeforeSave: false });
            } else {
                // 3. Brand-new user — derive a unique username
                const baseUsername = (googleEmail?.split('@')[0] || profile.id).toLowerCase();
                let username = baseUsername;
                let exists = await User.findOne({ username });
                let suffix = 1;
                while (exists) {
                    username = `${baseUsername}${suffix++}`;
                    exists = await User.findOne({ username });
                }

                try {
                    user = await User.create({
                        googleId: profile.id,
                        email: googleEmail,
                        fullName: profile.displayName,
                        username,
                    });
                } catch (createErr) {
                    // Race condition / duplicate: try fetching the existing record
                    if (createErr.code === 11000) {
                        user = await User.findOne({ $or: [{ googleId: profile.id }, { email: googleEmail }] });
                        if (!user) return done(createErr, null);
                        if (!user.googleId) {
                            user.googleId = profile.id;
                            await user.save({ validateBeforeSave: false });
                        }
                    } else {
                        return done(createErr, null);
                    }
                }
            }
        }

        // Generate JWTs
        const accessTokenJwt = jwt.sign(
            { _id: user._id, role: user.role, email: user.email, fullName: user.fullName, username: user.username },
            env.ACCESS_TOKEN_SECRET,
            { expiresIn: env.ACCESS_TOKEN_EXPIRY || '1d' }
        );
        const refreshTokenJwt = jwt.sign(
            { _id: user._id, role: user.role },
            env.REFRESH_TOKEN_SECRET,
            { expiresIn: env.REFRESH_TOKEN_EXPIRY || '7d' }
        );

        user.refreshToken = refreshTokenJwt;
        await user.save({ validateBeforeSave: false });

        return done(null, { accessToken: accessTokenJwt, refreshToken: refreshTokenJwt, user });
    } catch (err) {
        return done(err, null);
    }
}));


export default passport;
