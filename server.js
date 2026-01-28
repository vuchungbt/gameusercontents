require('dotenv').config();
const express = require('express');
const mongo = require('./config/mongo');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const users = require('./routes/api/user');
const auth = require('./routes/api/auth');
const bodyParser = require('body-parser');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors());

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

// Cookie Parser
app.use(cookieParser(process.env.JWT_SECRET));

const port = process.env.PORT || 3016;
app.listen(port, () => console.log(`Server started on port ${port}...`));

// Connect Database
mongo.connect();

// Routes
app.use('/api/user', users);
app.use('/api/auth', auth);

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 500,
        msg: 'Something went wrong on the server'
    });
});
