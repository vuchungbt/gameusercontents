const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//Creat UserSchema
const UserSchema = new Schema({
    name: {
        type: String,
        default: ""
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bestScore: {
        type: Number,
        default: 0
    },
    coin: {
        type: Number,
        default: 0
    },
    showAds: {
        type: Boolean,
        default: true
    },
    hatSkin: {
        type: [Number],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = User = mongoose.model("user", UserSchema);