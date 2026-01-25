const express = require('express');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');
const axios = require('axios');
//Model
const User = require('../../models/User');

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
                user: {
                    id: user._id,
                    name: user.name,
                    googleId: user.googleId,
                    email: user.email,
                    bestScore: user.bestScore,
                    coin: user.coin,
                    showAds: user.showAds,
                    hatSkin: user.hatSkin,
                    createdAt: user.createdAt
                },
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
// @desc Authenticate with Google
// @access Public
router.post('/google', async(req, res, next) => {
    try {
        const accessToken = req.body.access_token;
        
        if (!accessToken) {
            return res.status(400).json({
                status: 400,
                msg: 'Access token is required',
            });
        }

        const url = `${googleApi}?access_token=${accessToken}`;
        const datares = await axios.get(url);
        let datajson = datares.data;

        if (!datajson || !datajson.id) {
            return res.status(401).json({
                status: 401,
                msg: 'Auth failed - Invalid token',
            });
        }

        // Check for existing user by googleId
        let user = await User.findOne({
            googleId: datajson.id,
        });

        if (!user) {
            // Check if email already exists (in case user was created differently)
            user = await User.findOne({
                email: datajson.email,
            });

            if (user) {
                // Update existing user with googleId
                user.googleId = datajson.id;
                if (!user.name && datajson.name) {
                    user.name = datajson.name;
                }
                await user.save();
            } else {
                // Create new user
                user = new User({
                    name: datajson.name || '',
                    googleId: datajson.id,
                    email: datajson.email || '',
                    bestScore: 0,
                    coin: 0,
                    showAds: true,
                    hatSkin: [],
                    createdAt: new Date()
                });
                await user.save();
            }
        } else {
            // Update name if it's empty and we have new data
            if ((!user.name || user.name === '') && datajson.name) {
                user.name = datajson.name;
                await user.save();
            }
        }

        // Generate JWT token
        const token = jwt.sign({
            id: user._id,
            email: user.email,
        }, config.get('jwtSecret'), {
            expiresIn: 8640000, // 100 days
        });

        return res.status(200).json({
            status: 200,
            user: {
                id: user._id,
                name: user.name,
                googleId: user.googleId,
                email: user.email,
                bestScore: user.bestScore,
                coin: user.coin,
                showAds: user.showAds,
                hatSkin: user.hatSkin,
                createdAt: user.createdAt
            },
            token: token
        });

    } catch (err) {
        console.log('Google auth error:', err);
        res.status(401).json({
            status: 401,
            msg: 'Auth failed',
        });
    }
});

module.exports = router;