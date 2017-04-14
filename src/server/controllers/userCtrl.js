var User = require('../models/userModel.js');
var passport = require('passport');

module.exports = {
    authenticate: function(req, res, next) {
        passport.authenticate('local', function(err, user, info) {
            if (err) return res.status(500).send(err);
            if (!user) return res.status(404).send('No user found');
            return res.send(user);
        })(req, res, next);
    },
    create: function(req, res, next) {
        User.findOne({"email": req.body.email}, function(err, user) {
            if (user) {
                return res.status(403).send("Email already exists. Please use a different email.");
            } else {
                var newUser = new User();
                newUser.Username = req.body.Username;
                newUser.Email = req.body.Email;
                newUser.FirstName = req.body.FirstName;
                newUser.LastName = req.body.LastName;
                newUser.Roles = ['User'];
                newUser.generateHash(req.body.Password).then(function(response) {
                    newUser.Password = response;
                    newUser.save(function(err, result) {
                        if (err) {
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
    }
};