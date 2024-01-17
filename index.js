const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
const port = process.env.PORT || 8000;
const app = express();
app.use(express.urlencoded());
app.use(express.static('assets'));
const db = require('./config/mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');
const cron = require('node-cron');
const userController = require('./controllers/users_controller');

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

cron.schedule( '2 */30 * * *' ,() => {
    userController.cleanupShowProfile();
})

cron.schedule('0 0 * * *', () => {
    userController.resetLikeLimit();
})

cron.schedule('55 23 * * *', () => {
    userController.checkSubscription();
})

app.use(express.urlencoded());

app.use(session({
    name: 'codeial',
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        // domain: '.dateuni.in',
        path: '/',
        // secure: true,
        sameSite: 'None',
        // maxAge: (1000 * 60 * 100)
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the 'assets' directory
app.use('/assets', express.static('assets'));

app.use('/', require('./routes'));

app.listen(port, "0.0.0.0" , function (err) {
    if (err) {
        console.log('Error in running the server', err);
    }

    console.log('Yup!My Express server is running on port: ', port);
});
