const jwt = require('jsonwebtoken');

/**
 * @description  Middleware to verify the JWT on protected routes. Looks for the token
 *               in the httpOnly cookie first, then falls back to the Authorization header
 *               (Bearer token) — allowing both browser clients and API clients to authenticate.
 * @route        Applied globally to all protected routes via router or app.use()
 * @access       Internal middleware — not a direct endpoint
 */
function verifyToken(req, res, next) {
    // Support two token sources:
    // 1. httpOnly cookie — used by browser clients (set automatically on login/register)
    // 2. Authorization header — used by API clients e.g. Postman, mobile apps
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        // Verify signature and expiry — throws if the token is tampered with or expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach the decoded payload to req.user so downstream middleware
        // and controllers can access { id, role } without re-decoding the token
        req.user = decoded; // { id, role }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
}

/**
 * @description  Role-based authorization middleware factory. Accepts one or more allowed
 *               roles and returns a middleware function that blocks the request if the
 *               authenticated user's role is not in the allowed list.
 *               Must be used after verifyToken since it depends on req.user being set.
 * @route        Applied per-route — e.g. router.post('/projects', verifyToken, requireRole('admin', 'manager'), ...)
 * @access       Internal middleware — not a direct endpoint
 *
 * @example
 *   requireRole('admin')                 // admin only
 *   requireRole('admin', 'manager')      // either role is allowed
 */
function requireRole(...roles) {
    // Returns a standard Express middleware function (req, res, next)
    return (req, res, next) => {

        // Guard against requireRole being used without verifyToken before it
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized." });
        }

        // 403 Forbidden — user is authenticated but does not have the required role
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access denied. Required role: ${roles.join(' or ')}.` 
            });
        }

        next();
    };
}

module.exports = { verifyToken, requireRole };