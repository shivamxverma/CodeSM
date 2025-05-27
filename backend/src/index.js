const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const bcrypt = require('bcryptjs');
const PrismaClient = require('@prisma/client').PrismaClient;
const prisma = new PrismaClient();


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


app.get('/logout', (req, res) => {
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
    const User = req.body;
    const token = jwt.sign(User, secret, { expiresIn: '1h' });
    res.setHeader('Set-Cookie', cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600, 
        sameSite: 'strict',
    }));

    const hashedPassword = bcrypt.hashSync(User.password, 10);

    const newUser = {
        Username : User.Username,
        email: User.email,
        password: hashedPassword,
    }

    await prisma.user.create({
        data : newUser
    });

    res.json({
        msg: "Signup successful",
        user: newUser
    });
});

app.listen(8000,()=>{
    console.log("Server is Started")
});