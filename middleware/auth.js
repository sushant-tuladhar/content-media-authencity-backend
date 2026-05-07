const jwt=require('jsonwebtoken');
//Inactive session timeout
const SESSION_TIMEOUT = 1000 * 60 * 10; // 10 minutes

exports.sessionTimeout = (req, res, next) => {
    // console.log("Session handling here")

    if (req.session.user) {

        const now = Date.now();

        if (req.session.lastActivity &&
            now - req.session.lastActivity > SESSION_TIMEOUT) {

            req.session.destroy(() => {
                return res.redirect("/login");
            });
        }

        // update activity time
        req.session.lastActivity = now;
    }
    next();
}

exports.isAuthenticated= (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied' });
    }
}