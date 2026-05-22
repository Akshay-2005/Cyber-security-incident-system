const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_neon_cyber_security_sentinel_token_key_2026';

/**
 * Extracts and decodes Bearer token from authorization header.
 * Attaches the authenticated user metadata payload to the request object.
 */
module.exports = (req, res, next) => {
    // Read token from Authorization Header: "Bearer [token]"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access Denied: Secure session token missing' });
    }

    try {
        const verifiedUser = jwt.verify(token, JWT_SECRET);
        req.user = verifiedUser; // Verified token contents: id, name, email, role
        next();
    } catch (error) {
        console.warn('⚠️ [Auth Middleware] Invalid token verification attempt:', error.message);
        return res.status(403).json({ success: false, message: 'Forbidden: Session expired or signature invalid' });
    }
};
