// the passport strategies 

const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// Create local strategy
    // expects a username property so we need to explicitly state we are looking for the email property 
    const localOptions = { usernameField: 'email' };
    const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
        // verify this username and password, call done with the user 
        // if it is the correct username and password 
        // otherwise, call done with false 
        User.findOne({ email: email }, function(err, user) {
            if (err) { return done(err) } // err is search
            if (!user) return done(null, false)
    
            // compare passwords - is 'password' equal to user.password? 
            user.comparePassword(password, function(err, isMatch) {
                if (err) { return done(err); }
                if (!isMatch) { return done(null, false) }
    
                return done(null, user);
            })
        })
    });
    
    
    // set up options for JWT strategy
    const jwtOptions = {
        // looks in the header called authorization for the todent
        jwtFromRequest: ExtractJwt.fromHeader('authorization'),
        secretOrKey: config.secret
    };
    
    // create JWT strategy
        // payload: decoded JWT token (includes a subject (user id) and timestamp)
    const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
        // see if the user ID in the payload exists in our database 
        User.findById(payload.sub, function(err, user) {
            // if there is an error in the search call done, with false
            if (err) { return done(err, false)}
            // if it does call done with that user 
            if (user) {
                done(null, user);
            // otherwise call done without a user object 
            } else {
                done(null, false)
            }
        })
    })
    
    // tell passport to use this strategy
    passport.use(jwtLogin); 
    passport.use(localLogin);