const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
    username: String,
    googleId: String,
    facebookId:String,
    thumbnail: String,
    email: String,
    password:String,
    premiumTimer:Number
});

const User = mongoose.model('user', userSchema);

 const createUser = (newUser, callback) => {
	bcrypt.genSalt(10, function(err, salt) {
		bcrypt.hash(newUser.password, salt, function(err, hash) {
			newUser.password = hash;
			newUser.save(callback);
		});
	});
}

 const getUserByEmail = (email, callback) => {
  let Obj = {email: email}
  User.findOne(Obj, callback);
}

 const comparePassword = (password, hash, callback) => {
	bcrypt.compare(password, hash, function(err, isMatch){
		if(err) throw err;
		callback(null, isMatch);
	});
}

 const getUserById = (id, callback) => {
  	User.findById(id, callback);
}

module.exports = {
    User,
    createUser,
    getUserByEmail,
    comparePassword,
    getUserById}
    ;
