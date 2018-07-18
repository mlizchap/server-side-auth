// the schema and model for the user 

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

// create the schema 
const userSchema = new Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true 
    },
    password: String 
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
    // this = reference to our user model 
    // this.password = hashed and salted password
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) { return callback(err); }

        // if passwords match - isMatch is true; else false
        callback(null, isMatch)
    })
}


// on save hook, encrypt password
// before saving a function, run this function 
userSchema.pre('save', function(next) {
    console.log(this);
    const user = this; // getting access to the user model; user = instance of the user model 

    // generate a salt, then run callback (salt arg in callback is salt that we generated)
    bcrypt.genSalt(10, function(err, salt) {

        // hash (encrypt) our password using salt; gives us a hash(encrypted password in the callback function) 
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) { return next(err) }
            
            // overwrite plain text password with encrypted password
            user.password = hash;
            // move on to save the model
            next();
        })
    })
})

// create the model class
const User = mongoose.model('user', userSchema);

// export the model
module.exports = User; 