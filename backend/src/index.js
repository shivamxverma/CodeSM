import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import bcrypt from 'bcryptjs';
// import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/mydatabase');

import User from '../model/user'; 

const secret = "mysecret";

const app = express();

app.use(express.json());
app.use(cors());

app.get('/login', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            msg: "Unauthorized"
        });
    }

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                msg: "Unauthorized"
            });
        }
        res.json({
            msg: "Login successful",
            user: decoded
        });
    });
    redirectUrl = req.query.redirectUrl || '/';
    res.redirect(redirectUrl);
});


app.get('/logout', (_, res) => {
    res.setHeader('Set-Cookie', cookie.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0, 
        sameSite: 'strict',
    }));
    res.json({
        msg: "Logout successful"
    });
}
);

app.post('/signup',async (req, res) => {
    console.log(req.body);
    const userData = req.body;
    const token = jwt.sign(userData, secret, { expiresIn: '1h' });
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600, 
        sameSite: 'strict',
    }));

    const hashedPassword = bcrypt.hashSync(User.password, 10);

    const newUser = {
        username : User.username,
        email: User.email,
        password: hashedPassword,
    }

    const data = await User.create({
        data: newUser
    });

    console.log(data);

    res.json({
        msg: "Signup successful",
        user: newUser
    });
});

app.listen(8000,()=>{
    console.log("Server is Started")
});