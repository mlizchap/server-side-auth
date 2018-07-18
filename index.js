// SETUP: sets up the app/ connects to db/ sets up the server

const express = require('express');
const router = require('./router');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// DB setup
mongoose.connect('mongodb://localhost/server_side_auth');

// creating an instance of express
const app = express(); 

// middleware
app.use(bodyParser.json({ type: '*/*' })) 

// route handling
router(app);

// Server Setup 
const port = process.env.PORT || 3090; 
const server = http.createServer(app);
server.listen(port);
console.log('Server listening on', port);

