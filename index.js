var express = require('express'),
    config = require('./src/server/config'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    passport = require('passport'),
    localStrategy = require('passport-local'),
    path = require('path'),
    userCtrl = require('./src/server/controllers/userCtrl.js'),
    User = require('./src/server/models/userModel.js');

var MongoStore = require('connect-mongo')(session);

passport.use('local', new localStrategy({
    usernameField: 'UsernameEmail',
    passwordField: 'Password',
    passReqToCallback: true
}, function(req, email, password, done) {
    process.nextTick(function() {
        //possibly pull this code out to userCtrl
        User.findOne({'Email': email}, function(err, user) {
            if (err) return done(err);
            else if(user) {
                user.validPassword(password, user.Password)
                    .then(function(response) {
                        if (response) {
                            return done(null, user);
                        }
                        else {
                            return done('Password incorrect', false);
                        }
                    })
                    .catch(function(err) {
                        return done('Server Error', false);
                    });
            } else {
                return done('User not found', false);
            }
        });
    });
}));
passport.serializeUser(function(user, done) {
    done(null, user);
});
passport.deserializeUser(function(user, done) {
    done(null, user);
});

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + '/dist'));
app.use(session({
    secret: config.secret,
    saveUninitialized: config.saveUninitialized,
    resave: config.resave
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(config.mongoUri);
mongoose.connection.once('open', function() {
    console.log('Connected to MongoDB');
});
mongoose.Promise = require('q').Promise;


//Authentication Endpoints
app.post('/auth/login', userCtrl.authenticate);
app.post('/auth/addAccount', userCtrl.create, userCtrl.authenticate);

server.listen(config.port, function() {
    console.log('listening on port: ' + config.port);
});