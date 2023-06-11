
const mongoose = require('mongoose');
 
const userSchema = new mongoose.Schema({
    userId: {
        type: Number,
        require: true,
        unique: true
    },
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        require: true,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        required: true
    },
    // phone: {
    //     type: Number,
    //     required: true
    // },
    avatar: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});


const UserSchema = mongoose.model('UserSchema', userSchema);

module.exports = UserSchema;