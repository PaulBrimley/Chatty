var express = require("express"),
    config = require("./src/server/config"),
    cors = require("cors"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    session = require("express-session"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    path = require("path");

var MongoStore = require("connect-mongo")(session);

passport.use("local", new localStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
}, function(req, email, password, done) {
    process.nextTick(function() {
        //possibly pull this code out to userCtrl
        User.findOne({"email": email}, function(err, user) {
            if (err) return done(err);
            else if(user) {
                user.validPassword(password)
                    .then(function(response) {
                        if(response === true) {
                            user.loggedIn = true;
                            user.save(function(err, result) {
                                if (err) return done("Server Error", false);
                                else return done(null, result);
                            });
                        } else {
                            return done("Password incorrect", false);
                        }
                    })
                    .catch(function(err) {
                        return done("Server Error", false);
                    });
            } else {
                return done("User not found", false);
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
var server = require("http").Server(app);
var io = require("socket.io")(server);


app.use(bodyParser.json());
app.use(cors());
app.use(express.static(__dirname + '/dist'));

var mongoUri = config.mongoUri;
mongoose.connect(mongoUri);
mongoose.connection.once("open", function() {
    console.log("Connected to MongoDB");
});

var sessionMiddleware = session({
    secret: config.secret,
    saveUninitialized: config.saveUninitialized,
    resave: config.resave,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());


server.listen(config.port, function() {
    console.log("listening on port :" + config.port);
});
