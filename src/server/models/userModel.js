var mongoose = require('mongoose'),
	bcrypt = require('bcrypt-nodejs'),
	q = require('q');

var userSchema = new mongoose.Schema({
    Email: {type: 'String', unique: true},
    FacebookId: {type: 'String'},
    FirstName: {type: 'String'},
    LastName: {type: 'String'},
    Password: {type: 'String'},
    Photo: {type: 'String'},
    Roles: [{type: 'String', enum: ['Admin', 'User']}],
    Username: {type: 'String'}
});

userSchema.methods.generateHash = function (password) {
	var dfd = q.defer();
	bcrypt.genSalt(10, function (err, salt) {
		if (err) {
			return dfd.reject(err);
		}
		bcrypt.hash(password, salt, null, function (err, hash) {
			password = hash;
			return dfd.resolve(password);
		});
	});
	return dfd.promise;
};

userSchema.methods.validPassword = function (password, hash) {
	var dfd = q.defer();
	bcrypt.compare(password, hash, function (err, isMatch) {
		if (err) {
			return dfd.reject(false);
		}
		else {
			return dfd.resolve(isMatch);
		}
	});
	return dfd.promise;
};

module.exports = mongoose.model('users', userSchema);