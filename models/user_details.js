
const mongoose = require('mongoose');
 
const userDetailsSchema = new mongoose.Schema({
    userId: {
        type: Number,
        require: true,
        unique: true
    },
    email:{
        type: String,
        require: false,
        unique: true
    },
    online:{
        type: Number,
        required: false
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },
    verified:{
        type: Boolean,
        require: false
    },
    name:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    my_basic:{
        type: Array,
        require: false
    },
    image:{
        type: Array,
        require: true
    },
    college: {
        type: String,
        require: true
    },
    relationship_goals:{
        type: String,
        required: true
    },
    languages:{
        type: Array,
        require: true
    },
    gender: {
        type: String,
        require: true,
    },
    interest: {
        type: Array,
        required: true
    },
    bio: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        required: true
    },
    city:{
        type: String,
        require: true
    },
    location: {
        long: {
          type: Number,
          required: true
        },
        lat: {
          type: Number,
          required: true
        }
    },
    recommendationPreferences: {
        college: {
            type: String,
            require: false
        },
        radius:{
            type: Number,
            require: false
        },
        ageRange: {
          min: {
            type: Number,
            required: false 
          },
          max: {
            type: Number,
            required: false
          }
        }
    },
    showProfile:{
        type: Array,
        require: false
    },
    permission: {
        type: Number,
        require: true,
    },
    like: {
        type: Array,
        required: true
    },
    superLike: {
        type: Array,
        required: true
    },
    match:{
        type: Array,
        required: true
    },
    block:{
        type: Array,
        required: true
    }
}, {
    timestamps: true
});


const UserDetailsSchema = mongoose.model('UserDetailsSchema', userDetailsSchema);

module.exports = UserDetailsSchema;