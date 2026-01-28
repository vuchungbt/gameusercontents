const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');
//Model
const User = require('../../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleApi = 'https://www.googleapis.com/oauth2/v2/userinfo';

// @route GET api/auth/me
// @desc Get user data
// @access Private
router.get('/me', authMiddleware, (req, res) => {
    User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    msg: 'User not found',
                });
            }
            res.json({
                status: 200,
                user: user.toAuthJSON(),
            });
        })
        .catch((err) => {
            res.status(500).json({
                status: 500,
                msg: 'Server error',
            });
        });
});

// @route POST api/auth/google
// @desc Authenticate with Google (Supports ID Token or Access Token)
// @access Public
router.post('/google', async(req, res, next) => {
    try {
        const { id_token, access_token } = req.body;
        
        if (!id_token && !access_token) {
            return res.status(400).json({
                status: 400,
                msg: 'Google token is required',
            });
        }

        let userData = null;

        // 1. Ưu tiên xác thực bằng ID Token (Chuẩn bảo mật cao hơn cho Mobile)
        if (id_token) {
            try {
                const ticket = await googleClient.verifyIdToken({
                    idToken: id_token,
                    audience: process.env.GOOGLE_CLIENT_ID,
                });
                const payload = ticket.getPayload();
                userData = {
                    id: payload['sub'], // Google User ID
                    email: payload['email'],
                    name: payload['name']
                };
            } catch (error) {
                console.error('ID Token verification failed:', error.message);
                if (!access_token) {
                    return res.status(401).json({
                        status: 401,
                        msg: 'Invalid ID Token',
                    });
                }
            }
        }

        // 2. Fallback sang Access Token nếu không có ID Token hoặc verify ID Token thất bại
        if (!userData && access_token) {
            const url = `${googleApi}?access_token=${access_token}`;
            const datares = await axios.get(url);
            const datajson = datares.data;

            if (datajson && datajson.id) {
                userData = {
                    id: datajson.id,
                    email: datajson.email,
                    name: datajson.name
                };
            }
        }

        if (!userData) {
            return res.status(401).json({
                status: 401,
                msg: 'Auth failed - Unable to get user info',
            });
        }

        // Check for existing user by googleId
        let user = await User.findOne({
            googleId: userData.id,
        });

        if (!user) {
            // Check if email already exists
            user = await User.findOne({
                email: userData.email,
            });

            if (user) {
                // Link Google ID to existing email account
                user.googleId = userData.id;
                if (!user.name && userData.name) {
                    user.name = userData.name;
                }
                await user.save();
            } else {
                // Create new user
                user = new User({
                    name: userData.name || '',
                    googleId: userData.id,
                    email: userData.email || '',
                    bestScore: 0,
                    coin: 0,
                    showAds: true,
                    hatSkin: [],
                    createdAt: new Date()
                });
                await user.save();
            }
        } else {
            // Update name if empty
            if (!user.name && userData.name) {
                user.name = userData.name;
                await user.save();
            }
        }

        // Generate JWT token
        const token = jwt.sign({
            id: user._id,
            email: user.email,
        }, process.env.JWT_SECRET, {
            expiresIn: '30d',
        });

        return res.status(200).json({
            status: 200,
            user: user.toAuthJSON(),
            token: token
        });

    } catch (err) {
        console.error('Google auth error:', err);
        res.status(500).json({
            status: 500,
            msg: 'Internal Server Error',
        });
    }
});

module.exports = router;