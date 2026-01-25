const express = require('express');
const config = require('config');
const mongo = require('./config/mongo');
var cors = require('cors');
const cookieParser = require('cookie-parser');
const users = require('./routes/api/user');
const auth = require('./routes/api/auth');
const bodyParser = require('body-parser');
const authAdmin = require('./routes/admin/auth');
const user = require('./routes/admin/user');
const app = express();

const server = require("http").Server(app);
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);
app.use(bodyParser.json());
app.use(cookieParser(config.get('jwtSecret')));


const port = process.env.PORT || 3016;
server.listen(port, () => console.log(`Started on port ${port}...`));

app.use(express.json());
app.use(cors());

mongo.connect();
app.use('/api/user', users);
app.use('/api/auth', auth);
app.use('/admin/auth', authAdmin);
app.use('/admin/user', user);
