const mongoose = require("mongoose");
// config connect mongodb
exports.connect = async() => {
    try {
        const db = process.env.MONGO_URI;
        await mongoose.connect(db);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
    }
    return mongoose.connection;
};