var User = require('../models/userModel.js');

module.exports = {
    create: function(req, res, next) {
        User.findOne({"email": req.body.email}, function(err, user) {
            if (user) {
                return res.status(403).send("Email already exists. Please use a different email.");
            } else {
                var newUser = new User();
                newUser.userName = req.body.userName;
                newUser.email = req.body.email;
                newUser.generateHash(req.body.password).then(function(response) {
                    newUser.password = response;
                    newUser.save(function(err, result) {
                        if (err) {
                            console.log("err", err);
                            return res.status(500).send();
                        } else {
                            return next();
                        }
                    });
                });
            }
        });
    },
    getUser: function(req, res, next) {
        if (req.isAuthenticated()) {
            User.findById(req.user._id, function(err, user) {
                if (err) return res.status(500).send(err);
                else {
                    console.log(user);
                    return res.send(user);
                }
            });
        } else res.status(401).send();
    },
    login: function(req, email, password) {
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
    }
};