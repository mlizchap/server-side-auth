# Server Side Auth

## Example
- [Backend Auth App](https://github.com/mlizchap/back-end-auth-app)

## TOC
- [overview](#overview)
- [Folder Structure](#folder-structure)
- [Setup](#setup)
- [Express App and Server](#create-the-express-app-and-start-the-server)
- [The Router File](#setting-up-the-router-file)
- [The Model](#create-the-model) 
- [Mongoose Setup](#mongoose-setup)
- [The Authentication Controller](authentication-controller-setup)
- [Creating Items in the DB](#create-a-new-user-in-the-db)
- [Creating the Route Handler](#create-a-route-handler-for-signing-in-the-user)
- [Bcrypt](#bcrypt)
- [JSON Web Token(JWTs)](json-web-tokens)
- [Passport](#passport)
    - [Local Strategy](#local-strategy)
    - [JWT Strategy](#jwt-strategy)
- [Authentication Routes](#authenticate-routes)

## Overview
-  process of authentication: 
    - client makes request
    - server looks at username/pw
    - once credentionals are verified the server gives client an **identifying piece of info** 

- types of **identifying pieces of info**
1.  cookies:
    - included in HTTP requests by default
    -  brings state into the HTTP protocol.  
    - Cannot be set to different domaints
2. tokens: 
    - have to be wired up manually
    - can be set to any domain 

## Folder Structure
- **controllers/authentication.js**
    - exports functions for signing in / signing up user when they go to the signin endpoint 
- **models/user.js**
    - creates and exports a user model/schema
    - when creating the password contains `pre` middlewhere to encrypt the pw using bcrypt 
    - contains the logic to compare passwords when the user logs in 
- **services/passport.js**
    - contains passport strategies
        - a **local strategy** for when the first user logs on 
        - a **jwt strategy** for authenticating the user's token when they go to protected routes 
- **config.js** 
    - contains a secret -  used for encrypting the JWT
- **index.js**
    - creates and sets up the express app
    - connects to the DB
    - sets up the server 
- **router.js** 
    - exports functions for when the user visits `/siginin` or `/signup`
    - includes logic for protecting certin routes 
- **gitigore**
    - to prevent the secret and node modules from being commited to GH

## Setup
- `$ npm int` to create a package.json folder
- install dependencies
```
$ npm install --save express mongoose morgan body-parser 
```
- create a `.gitingore` file and put node_modules here (secret for encrypting pw will eventually go here also)

## Create the Express App and Start the Server
- create the express app
- in `index.js`
    ```java
    const express = require('express'); // library for handling http requests
    const app = express(); // creates an instance of express
    ```
- import the http module and set up the server
- in `index.js`
    ```java
    const http = require('http'); 

    const port = process.env.PORT || 3090; 
    const server = http.createServer(app);
    server.listen(port);
    console.log('Server listening on', port);
    ```

## Setting up the router file
- create the initial route for when the user reaches the home screen
- in `router.js`
    ```java
    module.exports = function(app) {
        app.get('/', function(req, res) {
            res.send({ greeting: 'hi' })
        })
    }
    ```
- export the function and import it into the index.js file 
- in `index.js`
    ```java
    const router= require('./router');

    router(app);
    ```
- *test to see if the route works* 

## Create the model 
- import the mongoose module and the Schema object 
- in `models/user.js`
    ```java
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    ```
- create the Schema and make sure the email is unique
- in `models/user.js`
    ```java
    const userSchema = new Schema({
        email: {
            type: String,
            unique: true,
            lowercase: true 
        },
        password: String 
    });
    ```
- create and export the module'
- in `models/user.js`
    ```java
    const ModelClass = mongoose.model('user', userSchema); // user model = represents a class of users 
    module.exports = ModelClass; 
    ```

## Database Setup
- import the mongoose module 
- in `index.js`
    ```java
    const mongoose = require('mongoose');
    ```
- connect to the mongoose server (if the table does not exists its created)
- in `index.js`
    ```java
    mongoose.connect('mongodb://localhost/auth');
    ```
## Authentication Controller Setup 
- export a function 
- in `controllers/authentication.js`
    ```java
        exports.signup = function(req, res, next) {
            res.send({ test: "signup" })
        }
    ```
- wire up in route handler in router.js
- in `router.js`
    ```java
    const Authentication = require('./controllers/authentication');

    module.exports = function(app) {
        app.post('/signin', Authentication.signup);
    }
    ```

## Create a New User in the DB
- inmport and wire up body parser in index.js; this is used for parsing requests in the body
- in `index.js`
    ```java
    const bodyParser = require('body-parser');
    app.use(bodyParser.json({ type: '*/*' })) 
    ```
- import the User model into the controller file
- in `controllers/authentication.js`
    ```java
    const User = require('../models/user');
    ```
- in the signup function - pull the email and password off of the request object
- in `controllers/authentication.js`
    ```java
    const email = req.body.email;
    const password = req.body.password;
    ```
- make sure an email and password are provided, if not send a message 
    ```java
    if (!email || !password) {
        return res.status(422).send({ error: 'You must provide an email and password'});
    }
    ```
- see if the user provided exists, if it does return an error, if not - create and save the new user to the DB
```java
    User.findOne({ email: email }, function(err, existingUser) {
        if (err) { return next(err) }
        if (existingUser) {
            res.status(422).send({ error: 'Email is in use'})
        }
        const user = new User({
            email: email,
            password: password
        });
        user.save(function(err) {
            if (err) { return next(err); }
            res.json({ test: 'user created' }); // JWT will eventually go here
        });
    })
```
- *test out to see if user is actually saved*

## Create a Route Handler for Signing in the user
- once we have their username and pw auth'd (with passport), we give them their token
- in `controllers/authentication.js`
```java
exports.signin = function(req, res, next) {
    res.send({ token: tokenForUser(req.user) })
}
```

## Bcrypt 
- never save passwords as plaintext, store as an encryption (bcrypt)
- salt + submitted password = hashed password 
- install bcrypt: `$ npm install --save bcrypt-nodejs`
- wire up Bcrypt  using `.pre` 
- in `models/user.js`
    ```java
    userSchema.pre('save', function(next) {
        // encryption logic for the pw will go here
    }
    ```
- generate a salt and then run a function where the salted pw will be the second arg, also get access to the user model 
    ```java
    userSchema.pre('save', function(next) {
        const user = this; // getting access to the user model; user = instance of the user model 
        bcrypt.genSalt(10, function(err, salt) { 
            // here we will assign the user given password to the salted password 
        }
    })
    ```
- assign the user given password to the salted password 
    ```java
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(user.password, salt, null, function(err, hash) {
            if (err) { return next(err) }
            user.password = hash;
            next(); // moves on to save the model 
        })
    })
    ```
- *now when user is saved, you should only see the encrypted password*

## JSON Web Tokens 
- an identifying piece of information given to user for future requests 
    - after user is saved - send back JWT 
    - user id + secret string = JWT 
    - need to keep string 100% secret (keep in config file and put in .gitignore)
- to create a JSON web token: 
- install jwt-simple
    ```java
    npm install --save jwt-simple
    ```
- create a config.js file and create a secret string
- in `config.js`
    ```java
        secret: 'fadhjafskdlfhasjlkdfhure' // can be any random string
    }
    ```
- import config and jwt lib into auth.js
- in `controllers/authentication.js`
    ```java
    const jwt = require('jwt-simple');
    const config = require('../config');
    ```
- create a function that takes a user and returns a new token using the secret
- in `controllers/authentication.js`
    ```java
    function tokenForUser(user) {
        const timestamp = new Date().getTime();
        return jwt.encode({ sub: user.id, iat: timestamp }, config.secret);
    }
    ```
- properties within json token object:
    - `sub` = subject, in our case the user
    - `iat` = issued at time, will be the timestamp  
- in the signup function, have the JWT returned in the response after the user is successfully saved 
    ```java
    exports.signup = function(req, res, next) {
            //... 
            user.save(function(err) {
                res.json({ token: tokenForUser(user) });
            });
        })
    }
    ```

## Passport
- a library for authentication/ verifcation
    - authenticates the user when they loggin
    - verifies the user when they visit protected route 
- install passport and passport-jwt
    ```
    npm install --save passport passport-jwt
    ```
- create a passport.js file in a folder called services and import modules
- in `services/passport.js`
    ```java
    const passport = require('passport');
    const User = require('../models/user');
    const config = require('../config');
    const JwtStrategy = require('passport-jwt').Strategy;
    const ExtractJwt = require('passport-jwt').ExtractJwt;
    const LocalStrategy = require('passport-local');
    ```
- **strategies** - methods for authenticating a user. EX: can verify with JWT or username/password (local)

### Local strategy
- set up options, by default expects a username so we need to explicitey state we are using an email 
- in `services/passport.js`
    ```java
    const localOptions = { usernameField: 'email' };
    ```
- need to add a method to the user model to do password comparison 
- use the methods property to create a new method called Passwords
- in `models/user.js`
    ```java
    userSchema.methods.comparePassword = function(candidatePassword, callback) {
        // this = reference to our user model 
        // this.password = hashed and salted password
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
            if (err) { return callback(err); }

            // if passwords match - isMatch is true; else false
            callback(null, isMatch)
        })
    }
    ```
- create the strategy.  The strategy will take the email and password the user submitted and will search the db and then use the `comparepassords` method defined in the user model to compare the pw submitted to the pw in the db.  If it finds a matching username/pw it will return the user, else it will return null.
- in `services/authentication.js`
    ```java

    const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
        User.findOne({ email: email }, function(err, user) {
            if (err) { return done(err) } // err in search
            if (!user) return done(null, false)

            user.comparePassword(password, function(err, isMatch) {
                if (err) { return done(err); }
                if (!isMatch) { return done(null, false) }

                return done(null, user);
            })
        })
    });
    ```
- tell passport to use the strategy
    ```java
    passport.use(localLogin);
    ```



### JWT Strategy 
- in the callback function uses the JWT payload - a decoded JWT token.  Includes a subject (user id) and timestamp.  The strategy checks if the user in the payload (sub) is in the db.  If it is it returns a user, if not it returns false.
- create the jwt options 
- in `services/authentication.js`
    ```javascript
        const jwtOptions = {
            // looks in the header called authorization for the token
            jwtFromRequest: ExtractJwt.fromHeader('authorization'),
            secretOrKey: config.secret
        };
    ```
- in `services/authentication.js`
    ```java
    const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
        User.findById(payload.sub, function(err, user) {
            if (err) { return done(err, false)}
            if (user) {
                done(null, user);
            } else {
                done(null, false)
            }
        })
    })
    ```
- tell passport to use the strategy: 
    ```java
    passport.use(jwtLogin); 
    ```
## Authenticate Routes
- we need to tell particular routes to use passport, use auth object as middleware
    ```java
    app.get(<route>, requireAuth, () => {})
    ```
- import modules:
- in `router.js`
    ```java
    const Authentication = require('./controllers/authentication');
    const passportService = require('./services/passport');
    const passport = require('passport');
    ```
- create authentication with the JWT (JWT strategy)
    - create an object to unsert between incoming requests and the route handler 
        ```java
        const requireAuth = passport.authenticate('jwt', { session: false }); // session false = not cookie based 
        ```
    - use the objects to insert in between the route and the route handler 
        ```java
        app.get('/', requireAuth, function(req, res) {
            res.send({ hi: 'there' });
        })
        app.post('/signup', Authentication.signup);
        ```     
- create authentication using the email/password (local strategy)
    - create the requireSignin object that will be used as middleware
    ```java
    const requireSignin = passport.authenticate('local', { session: false });
    ```
    - add the `requreSignin` object as middleware
    ```java
    app.post('/signin', requireSignin, Authentication.signin);
    ```
    
 - *to test out*: 
    - `/signup`: send a post with new user in body - should give back a response object as a token
   - `/` - use JWT response object in the header to go to protected route
   - `/signin`: send a post request with existing user - should get back JWT to insert in header to go to existing routes
