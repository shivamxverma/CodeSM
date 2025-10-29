import express from 'express';
import {
    registerUser,
    loginUser,
    LogoutUser,
    refreshAccessToken,
} from './auth-controller';

const app = express.Router();

app.post('/register',registerUser);

app.post('/login',loginUser);

app.post('/logout',LogoutUser);

app.post('/refresh-token',refreshAccessToken);

export default app;


