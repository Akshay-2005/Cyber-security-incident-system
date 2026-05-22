/**
 * Restricts access to routes based on user roles (e.g. Admin, Security Engineer).
 * Must be declared after authMiddleware has loaded the user context.
 * @param {...String} allowedRoles Array of roles authorized to invoke this route
 */
module.exports = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Unauthorized: User authentication required' });
        }

        const userRole = req.user.role;
        
        if (!allowedRoles.includes(userRole)) {
            console.warn(`⚠️ [Role Middleware] User [${req.user.email}] with role [${userRole}] blocked from restricted route.`);
            return res.status(403).json({ 
                success: false, 
                message: `Access Denied: Your profile role (${userRole}) is not authorized to execute this command.` 
            });
        }

        next();
    };
};
