const jwt = require("jsonwebtoken");

function auth(req, res, next) {

    const token = req.header("auth-token");

    if (!token || token == "null" || token == "" || token == null || token == undefined) {
        return res.status(401).json({
            status: 401,
            msg: "No token, authorization denied"
        });
    }
    //Check for token

    try {
        // Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // Add user from payload
        req.user = decodedToken;
        next();
    } catch (e) {
        return res.status(400).json({
            status: 400,
            msg: "Token is invalid"
        });
    }
}

module.exports = auth;