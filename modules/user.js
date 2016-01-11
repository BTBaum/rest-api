// Calling Packages
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

// User Schema
var UserSchema = new Schema({
  name: String,
  username: { type: String, require: true, index: { unique: true}},
  password: { type: String, require: true, select: false }
});

// Hash the password before the user is saved
UserSchema.pre('save', function(next) {
  var user = this;

  // Hash the pw only if the pw has been changed or user is new
  if (!user.isModified('password')) return next();

  // Generate hash
  bcrypt.hash(user.password, null, null, function(err, hash) {
    if (err) return next(err);

    // change the ps to the hashed pw version
    user.password = hash;
    next();
  });
});

UserSchema.methods.comparePassword = function(password) {
  var user = this;

  return bcrypt.compareSync(password, user.password);
};

// return the model
module.exports = mongoose.model('User', UserSchema);
