// Radhe Shyam 
// console.log("Radhe Shyam");
const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
const port = 8000;
const app = express();
app.use(express.urlencoded());
app.use(express.static('assets'));
const db = require('./config/mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
require('dotenv').config();

// const server = http.createServer(app);
// const io = socketIO(server);
// io.listen(5000);
// console.log("Socket.io is running on port 5000")

// setup the chat server to be used with socket.io
// const chatServer = require('http').Server(app);
// const chatSockets = require('./config/chat_socket').chatSocket(chatServer);
// chatServer.listen(5000);
// console.log('chat server is listening on port 5000');

app.use(express.urlencoded());

app.use(session({
    name: 'codeial',
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    // cookie: {
    //     maxAge: (1000 * 60 * 100)
    // }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes'));

app.listen(port, function (err) {
    if (err) {
        console.log('Error in running the server', err);
    }

    console.log('Yup!My Express server is running on port: ', port);
});