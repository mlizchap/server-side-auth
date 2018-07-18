// functions for signing in / signing up users when they hit their respective endpoints 

const User = require('../models/user');
const jwt = require('jwt-simple');
const config = require('../config');

function tokenForUser(user) {
    const timestamp = new Date().getTime();
    // jwt.encode: 1st arg: info to incode (an obejct)
                        // sub property: subject - who the token belongs to     
                        // iat: issued at time 
                //  2nd arg: secret used to encode
    return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
}

exports.signin = function(req, res, next) {
    // user has their email and pw auth'd
    // we need to give them their token
    // req.user: from local strategy, the callback fn assigned the user model to req.user

    res.send({ token: tokenForUser(req.user) })
}

exports.signup = function(req, res, next) {
    // pull data off of req object
    const email = req.body.email;
    const password = req.body.password;

    // make sure an email and password are entered
    if (!email || !password) {
        return res.status(422).send({ error: 'You must provide an email and password'});
    }

    // see if a user with the given email exists
    User.findOne({ email: email }, function(err, existingUser) {
        if (err) { return next(err) }

        // if a user with the email exists, return an error
        if (existingUser) {
            res.status(422).send({ error: 'Email is in use'})
        }

        // if a user with email does NOT exist, create and save user record

         // create the user 
        const user = new User({
            email: email,
            password: password
        });

        // save to db
        user.save(function(err) {
            if (err) { return next(err); }
            res.json({ token: tokenForUser(user) });
        });
    })
}
