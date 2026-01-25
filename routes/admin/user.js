const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authAdmin")
const User = require("../../models/User");
const mongo = require("mongoose");
Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
};

router.get("/", auth.logged, (req, res) => {
    res.render("user/user.pug")
})

router.post("/", auth.logged, async(req, res) => {
    const _id = req.body.id;
    try {
        var user = null;
        if (mongo.isValidObjectId(_id)) {
            const userByID = await User.find({
                _id
            });
            user = userByID[0];
        } else {
            // Try to find by email or googleId
            const userByEmail = await User.find({
                email: _id
            });
            if (userByEmail.length > 0) {
                user = userByEmail[0];
            } else {
                const userByGoogleId = await User.find({
                    googleId: _id
                });
                user = userByGoogleId[0] || null;
            }
        }
        if (user != null) {
            res.render("user/profile", {
                user: user
            });
            return;
        }
        res.render("user/user.pug", {
            mess: "ID user, email or googleId not found"
        })
    } catch (error) {
        res.render("user/user.pug", {
            mess: "ID user, email or googleId not found"
        })
    }
})

router.get("/delete/:_id", auth.logged, async(req, res) => {
    const _id = req.params._id;
    try {
        await User.findByIdAndDelete(_id);
        res.render("user/user.pug");
    } catch (error) {
        const user = await User.findById(_id);
        res.render("user/profile", {
            user
        });
    }
})

// Note: Block/unblock functionality removed as it's not in the new user structure
// If needed, you can add a new field like 'isBlocked' to the User model
module.exports = router;