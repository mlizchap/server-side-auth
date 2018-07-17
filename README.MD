# Server Side Auth

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

## Folder Strucutre
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
- create a `.gitingore` file: this will be where the 

## Index.js
- modules to import:
    ```java
    const express = require('express'); // library for handling http requests
    const http = require('http'); // module for http requests
    const bodyParser = require('body-parser'); // for parsing the body of http requests
    const morgan = require('morgan'); // for logging
    const router= require('./router'); // contains the route handlers 
    const mongoose = require('mongoose'); // an ODM for working with MongoDB
    ```
- create an instance of express
    ```java
    const app = express(); // creates an instance of express
    ```
- setup the middleware for the app
    ```java
    app.use(morgan('combined')); 
    app.use(bodyParser.json({ type: '*/*' })) 
    ```
- hook up the route handlers to the app
    ```java
    router(app);
    ```
- set up the server
    ```java
    const port = process.env.PORT || 3090; 
    const server = http.createServer(app);
    server.listen(port);
    console.log('Server listening on', port);
    ```
