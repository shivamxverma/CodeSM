
function Auth(req, res, next) {
    const data = req.headers['authorization'];

    if (!data || !data.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    const token = data.split('Bearer ')[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    next();
}

export default Auth;