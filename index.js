// Radhe Shyam 
// console.log("Radhe Shyam");
const express = require('express');
const port = 8000;
const app = express();
app.use(express.urlencoded());
app.use(express.static('assets'));
const db = require('./config/mongoose');

app.use(express.urlencoded());

app.use('/', require('./routes'));

app.listen(port, function (err) {
    if (err) {
        console.log('Error in running the server', err);
    }

    console.log('Yup!My Express server is running on port: ', port);
});