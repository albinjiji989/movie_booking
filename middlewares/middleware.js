const jwt = require("jsonwebtoken");
const tokenModel = require("../models/tokenSchema");
const secretkey = process.env.JWT_SECRET;

// Helper function to extract token from the request
function extractToken(req) {
    let token = req.headers['token'] || req.body.token || req.query.token; // No need for 'authorization' in headers if it's not using Bearer

    if (!token) return null;

    // Ensure token is valid if it's prefixed with "Bearer"
    if (token.startsWith("Bearer ")) {
        token = token.slice(7); // Remove "Bearer " prefix
    }
    return token;
}

// Validate the token in the database
async function validateTokenInDb(token) {
    const exists = await tokenModel.findOne({ token });
    return !!exists;  // Return true if token exists in the database
}

// Middleware to authorize user roles
async function authorizeRole(req, res, next, expectedRole) {
    try {
        const token = extractToken(req);

        if (!token) {
            return res.status(403).json({ success: false, message: "Access denied: No token provided" });
        }

        // Decode the token
        const decoded = jwt.verify(token, secretkey);
        req.user = decoded; // Attach decoded user to the request object

        // Debugging: Log the decoded token to see its contents
        console.log('Decoded JWT:', decoded);

        // Check if the token is valid by looking it up in the database
        const isValid = await validateTokenInDb(token);
        if (!isValid) {
            return res.status(403).json({ success: false, message: "Access denied: Invalid token" });
        }

        // If role-based authorization is needed, ensure the role matches
        if (expectedRole && decoded.role !== expectedRole) {
            return res.status(403).json({ success: false, message: `Access denied: ${expectedRole}s only` });
        }

        next(); // Proceed if everything is valid
    } catch (error) {
        console.error("Authorization Error: ", error); // Log errors for debugging
        return res.status(403).json({
            success: false,
            message: "Access denied: Token verification failed",
            error: error.message,
        });
    }
}

module.exports = {
    isAdmin: async (req, res, next) => {
        await authorizeRole(req, res, next, "admin");
    },
    isUser: async (req, res, next) => {
        await authorizeRole(req, res, next, "User");
    }
};
