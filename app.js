const session = require('express-session');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const passport = require('passport');
const passportConfig = require('./passport-config');
const MongoDBStore = require('connect-mongodb-session')(session);
const config = require('./config');
global.defaultConfig = config;
require('./mongo_connector')();
const sessionStore = new MongoDBStore({
    uri: 'mongodb://' + config.mongo.host + ':' + config.mongo.port + '/' + config.mongo.db,
    databaseName: config.mongo.db,
    collection: 'sessions',
    connectionOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000
    }
});

const app = express();
const corsOptions = {
    credentials: true, // This is important.
    origin: (origin, callback) => {
        //if(whitelist.includes(origin))
        return callback(null, true)

        //callback(new Error('Not allowed by CORS'));
    }
}
app.use(cors(corsOptions));

global.rootDir = __dirname;
global.sqlErrorResponse = function (err, res) {
    if (err.code === "ER_DUP_ENTRY") {
        return res.json({status: "Error", message: 'Duplicate Entry'});
    }
    console.error("SQL ERR:", err.sqlMessage);
    return res.json({status: "Error", message: 'There was some error'});
};

global.dbErrorHandler = function (err) {
    if (err.code === "ER_DUP_ENTRY") {
        return 'Duplicate Entry';
    }
    console.error("DB ERR:", err.message);
    return 'There was some error';
};

global.routeCBHandler = function cbHandler(err, result, res) {
    res.json({status: err ? "Error" : "Success", message: err ? err : result});
};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

passportConfig(passport);

app.use(session({
    key: 'token',
    secret: config.sessionSecret,
    store: sessionStore,
    name: 'token',
    touchAfter: 24 * 3600, resave: true, saveUninitialized: true, autoRemove: 'native',
    cookie: {secure: false, maxAge: new Date().getTime() + (60 * 60 * 24 * 1000 * 7)},
}));

app.use(passport.initialize());
app.use(passport.session());

let authMiddleWare = function (req, res, next) {
    if (req.isAuthenticated() && req.user) {
        delete req.user.password;
        delete req.user.tfa;
        next();
    } else {
        res.status(401).json({status: "Error", message: "Unauthorized Access"});
    }
};

let authMiddleWareAdmin = function (req, res, next) {
    if (req.isAuthenticated() && req.user) {
        if (req.user.role === 1) {
            delete req.user.password;
            delete req.user.tfa;
            next();
        } else {
            res.status(403).json({status: "Error", message: "Unauthorized Access"});
        }
    } else {
        res.status(401).json({status: "Error", message: "Unauthorized Access"});
    }
};

global.authMiddleWare = authMiddleWare;
global.authMiddleWareAdmin = authMiddleWareAdmin;

app.post('/signup', function (req, res, next) {
    passport.authenticate('local-signup', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (info) {
            return res.json(info);
        }
    })(req, res, next);
});

app.post('/login', function (req, res, next) {
    passport.authenticate('local-login', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (info) {
            return res.json(info);
        }
        // req / res held in closure
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            delete user.password;
            delete user.tfa;
            return res.json({status: "Success", message: "Success"});
        });

    })(req, res, next);
});

app.get('/profile', authMiddleWare, (req, res) => {
    res.json({status: 'Success', message: req.user});
});

app.get('/mini-profile', authMiddleWare, (req, res) => {
    let result = {
        _id: req.user['_id'],
        id: req.user['id'],
        first_name: req.user['first_name'],
        last_name: req.user['last_name'],
        displayName: req.user['displayName'],
        status: req.user['status'],
    };
    res.json({status: 'Success', message: result});
});

app.get('/logout', (req, res) => {
    req.logout();
    return res.json({status: 'Success', message: 'Success'});
});

app.get('/lockUser', (req, res) => {
    req.session.locked = true;
    return res.json({status: 'Success', message: 'Success'});
});
const userManager = require('./controllers/user_manager');
app.post('/unlockUser', authMiddleWare, (req, res) => {
    userManager.getUserDetails(req.user.id, async (err, data) => {
        if (err) {
            res.json({status: 'Failure', message: "DB Error", error: err.message});
        } else if (data) {
            if (!bcrypt.compareSync(req.body.password, data.password)) {
                return res.json({status: 'Failure', message: 'Invalid Password'});
            }
            req.session.locked = false;
            return res.json({status: 'Success', message: 'Success'});
        }
    });
});

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const groupRouter = require('./routes/group');
const postRouter = require('./routes/post');
const categoryRouter = require('./routes/category');

app.use('/', indexRouter);
app.use(defaultConfig.baseUrlPath + '/users', authMiddleWare, usersRouter);
app.use(defaultConfig.baseUrlPath + '/category', authMiddleWare, categoryRouter);
app.use(defaultConfig.baseUrlPath + '/group', authMiddleWare, groupRouter);
app.use(defaultConfig.baseUrlPath + '/post', authMiddleWare, postRouter);
require('./routes/file_upload')(app);

// error handler
app.use(function (err, req, res, next) {
    res.status(err.status || 500).json({"status": "Failure", "message": err.message});
});

function testDb(cb) {
    cb(null, true);
}

global.onServerStartExecute = () => {
    testDb((err, status) => {
        console.error(status, err);
        if (err) {
            if (err.code === 'ER_BAD_DB_ERROR') {
                console.error("Database '' does not Exist!");
            } else if (err.code === 'ERR_SOCKET_BAD_PORT') {
                console.error("Invalid Port Number Specified");
            } else if (err.code === 'ECONNREFUSED') {
                console.error("MySQL Server not started or Port number is Invalid");
            } else {
                console.error("MySQL Server not started or Port number is Invalid");
            }
            // console.error(err);

            process.kill(process.pid, 'SIGTERM');
            try {
                process.kill(process.pid, 'SIGINT');
            } catch (e) {
                console.error(e);
            }
            //Terminate
        } else if (status) {
            //Continue
            serverStartScripts();
        }
    });
};

function serverStartScripts() {
    const userModel = require('./models/user');
    let user = new userModel.User({
        first_name: "Lokesh", last_name: "Jain", role: 1,
        email: "luckycreationsindia@gmail.com", password: "123"
    });
    require('./controllers/user_manager').addUser(null, user, (err, data) => {
        if (err) return console.error(err);
        console.log("SUCCESS:", data);
    }, true);
}

global.permissionCheck = (user, permissionToCheck) => {
    if (user.role === 1) return true;
    switch (permissionToCheck) {
        case 'usermanager':
            return user.permList.includes(0);
        case 'categorymanager':
            return user.permList.includes(1);
        case 'groupmanager':
            return user.permList.includes(2);
        case 'postmanager':
            return user.permList.includes(3);
        default:
            return false;
    }
};

module.exports = app;