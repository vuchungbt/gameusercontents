const mongoose = require("mongoose");
const config = require('config');
// config connect mongodb
exports.connect = async() => {
    try {
        await mongoose.connect(config.get("mongoURI"));
        console.log("db connection");
    } catch (error) {
        console.log(error);
    }
    return mongoose.connection;
};