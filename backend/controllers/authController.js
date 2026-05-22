const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_neon_cyber_security_sentinel_token_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Helper to sign JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, name: user.name, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

/**
 * Registers a new SOC security user
 */
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'Email address already registered' });
        }

        // Create new user (password is automatically hashed via pre-save hook)
        const user = await User.create({ name, email, password, role });
        const token = generateToken(user);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ [Auth Controller] Signup Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error during registration', error: error.message });
    }
};

/**
 * Validates credentials and logs in the analyst
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Ensure fields provided
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Sign token
        const token = generateToken(user);

        return res.json({
            success: true,
            message: 'Authentication successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('❌ [Auth Controller] Login Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error during authentication', error: error.message });
    }
};

/**
 * Returns current authenticated analyst user profile information
 */
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }
        return res.json({ success: true, user });
    } catch (error) {
        console.error('❌ [Auth Controller] Get Profile Error:', error);
        return res.status(500).json({ success: false, message: 'Internal server error retrieving user profile' });
    }
};
