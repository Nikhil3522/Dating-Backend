//require the library
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://localhost/Dating", { useNewUrlParser: true });

const db = mongoose.connection;

// error 
db.on('error', console.error.bind(console, 'error connecting to db'));

// up and running then print the message 
db.once('open', function(){
    console.log('Successfuly connected to the datebase');
});