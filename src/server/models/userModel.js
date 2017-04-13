var mongoose = require('mongoose'),
	bcrypt = require('bcrypt-nodejs'),
	q = require('q');

var userSchema = new mongoose.Schema({
    email: {type: 'String', unique: true},
    facebookId: {type: 'String'},
    firstName: {type: 'String'},
    lastName: {type: 'String'},
    password: {type: 'String'},
    photo: {type: 'String'},
    roles: [{type: 'String', enum: ['Admin', 'User']}],
    userName: {type: 'String'}
});

userSchema.methods.generateHash = function (password) {
	var dfd = q.defer();
	bcrypt.genSalt(10, function (err, salt) {
		if (err) {
			dfd.reject(err);
		}
		bcrypt.hash(password, salt, null, function (err, hash) {
			password = hash;
			dfd.resolve(password);
		});
	});
	return dfd.promise;
};

userSchema.methods.validPassword = function (password) {
	var dfd = q.defer();

	bcrypt.compare(password, this.password, function (err, isMatch) {
		if (err) {
			dfd.reject(err);
		}
		else {
			dfd.resolve(isMatch);
		}
	});
	return dfd.promise;
};

module.exports = mongoose.model('users', userSchema);