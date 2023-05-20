
const mongoose = require('mongoose');
 
const maleListSchema = new mongoose.Schema({
    maleList: {
        type: Array,
        require: true,
        unique: false
    },
}, {
    timestamps: true
});


const MaleListSchema = mongoose.model('MaleListSchema', maleListSchema);

module.exports = MaleListSchema;