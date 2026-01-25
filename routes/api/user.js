const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');
const User = require('../../models/User');

// @route GET api/user
// @desc Get user data
// @access Private
router.get('/', authMiddleware, (req, res) => {
    User.findById(req.user.id)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    msg: 'User not found',
                });
            }
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
            });
        })
        .catch((err) => {
            return res.status(500).json({
                status: 500,
                msg: 'Server error',
            });
        });
});

// @route POST api/user/update
// @desc Update user data
// @access Private
router.post('/update', authMiddleware, (req, res) => {
    const userId = req.user.id;
    const { name, bestScore, coin, showAds, hatSkin } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (bestScore !== undefined) updateData.bestScore = bestScore;
    if (coin !== undefined) {
        // Ensure coin is a number
        const coinValue = typeof coin === 'string' ? parseFloat(coin) : coin;
        if (isNaN(coinValue)) {
            return res.status(400).json({
                status: 400,
                msg: 'coin must be a valid number',
            });
        }
        updateData.coin = coinValue;
    }
    if (showAds !== undefined) updateData.showAds = showAds;
    if (hatSkin !== undefined) updateData.hatSkin = hatSkin;

    User.findByIdAndUpdate(userId, updateData, { new: true })
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    msg: 'User not found',
                });
            }
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
            });
        })
        .catch((err) => {
            return res.status(400).json({
                status: 400,
                msg: 'Update failed',
            });
        });
});

// @route POST api/user/updateScore
// @desc Update best score
// @access Private
router.post('/updateScore', authMiddleware, (req, res) => {
    const userId = req.user.id;
    const { bestScore } = req.body;

    if (bestScore === undefined || typeof bestScore !== 'number') {
        return res.status(400).json({
            status: 400,
            msg: 'bestScore is required and must be a number',
        });
    }

    User.findById(userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    msg: 'User not found',
                });
            }
            // Only update if new score is higher
            if (bestScore > user.bestScore) {
                user.bestScore = bestScore;
                return user.save();
            }
            return user;
        })
        .then((user) => {
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
            });
        })
        .catch((err) => {
            return res.status(400).json({
                status: 400,
                msg: 'Update failed',
            });
        });
});

// @route POST api/user/updateCoin
// @desc Update coin
// @access Private
router.post('/updateCoin', authMiddleware, (req, res) => {
    const userId = req.user.id;
    const { coin } = req.body;

    if (coin === undefined) {
        return res.status(400).json({
            status: 400,
            msg: 'coin is required',
        });
    }

    // Convert to number if it's a string, validate it's a valid number
    const coinValue = typeof coin === 'string' ? parseFloat(coin) : coin;
    if (isNaN(coinValue) || typeof coinValue !== 'number') {
        return res.status(400).json({
            status: 400,
            msg: 'coin must be a valid number',
        });
    }

    User.findByIdAndUpdate(userId, { coin: coinValue }, { new: true })
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    msg: 'User not found',
                });
            }
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
            });
        })
        .catch((err) => {
            return res.status(400).json({
                status: 400,
                msg: 'Update failed',
            });
        });
});

// @route POST api/user/updateHatSkin
// @desc Update hat skin array
// @access Private
router.post('/updateHatSkin', authMiddleware, (req, res) => {
    const userId = req.user.id;
    const { hatSkin } = req.body;

    if (hatSkin === undefined || !Array.isArray(hatSkin)) {
        return res.status(400).json({
            status: 400,
            msg: 'hatSkin is required and must be an array',
        });
    }

    // Validate all elements are numbers
    if (!hatSkin.every(item => typeof item === 'number')) {
        return res.status(400).json({
            status: 400,
            msg: 'All hatSkin items must be numbers',
        });
    }

    User.findByIdAndUpdate(userId, { hatSkin }, { new: true })
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    msg: 'User not found',
                });
            }
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
            });
        })
        .catch((err) => {
            return res.status(400).json({
                status: 400,
                msg: 'Update failed',
            });
        });
});

// @route POST api/user/toggleAds
// @desc Toggle showAds
// @access Private
router.post('/toggleAds', authMiddleware, (req, res) => {
    const userId = req.user.id;

    User.findById(userId)
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    status: 404,
                    msg: 'User not found',
                });
            }
            user.showAds = !user.showAds;
            return user.save();
        })
        .then((user) => {
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
            });
        })
        .catch((err) => {
            return res.status(400).json({
                status: 400,
                msg: 'Update failed',
            });
        });
});

module.exports = router;
