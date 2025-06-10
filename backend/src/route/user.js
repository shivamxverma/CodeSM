import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../model/user.js'; 
import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = express();

router.post('/login',async (req, res) => {
    const data = req.body;
    const { Username, Password } = data;
    const user = await User.findOne({ username: Username });
    
    if (!user) {
        return res.status(401).json({
            msg: "Invalid username or password"
        });
    }
    
    const token = jwt.sign(data,process.env.SECRET_KEY);
    
    res.cookie('token', token, {
        httpOnly: true,       
        secure: false,       
        sameSite: 'strict', 
        maxAge: 3600000     
    });
    
    
    const isPasswordValid = bcrypt.compareSync(Password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({
            msg: "Invalid username or password"
        });
    }
    
    res.json({ message: 'Logged in successfully' });
});

// router.get('/check-cookie', (req, res) => {
//     console.log(req.cookies); 
//     res.json({ cookies: req.cookies });
// });

// router.get('/logout', (_, res) => {
//     res.setHeader('Set-Cookie', cookie.serialize('token', '', {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         maxAge: 0, 
//         sameSite: 'strict',
//     }));
//     res.json({
//         msg: "Logout successful"
//     });
// });

router.post('/signup',async (req, res) => {
    const userData = req.body;
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