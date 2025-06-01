import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import bcrypt from 'bcryptjs';
import User from '../model/user.js'; 
import express from 'express';
const secret = "mysecret";
import dotenv from 'dotenv';
dotenv.config();

const router = express();

router.post('/login',async (req, res) => {
    const { Username, Password } = req.body;
    const user = await User.findOne({ username: Username });

    if (!user) {
        return res.status(401).json({
            msg: "Invalid username or password"
        });
    }

    const token = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '1h' });
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600,
        sameSite: 'strict',
    }));

    const isPasswordValid = bcrypt.compareSync(Password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({
            msg: "Invalid username or password"
        });
    }

    res.status(200).json({
        msg: "Login successful"
    });
});


router.get('/logout', (_, res) => {
    res.setHeader('Set-Cookie', cookie.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0, 
        sameSite: 'strict',
    }));
    res.json({
        msg: "Logout successful"
    });
});

router.post('/signup',async (req, res) => {
    console.log(req.body);
    const userData = req.body;
    const token = jwt.sign(userData, secret, { expiresIn: '1h' });
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600, 
        sameSite: 'strict',
    }));

    const hashedPassword = bcrypt.hashSync(userData.password, 10);

    const newUser = {
        username : userData.username,
        email: userData.email,
        password: hashedPassword,
    }

    const data = await User.create(newUser);

    res.json({
        msg: "Signup successful",
        user: newUser
    });
});

export default router;