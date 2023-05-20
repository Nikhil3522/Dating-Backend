
const mongoose = require('mongoose');
 
const femaleListSchema = new mongoose.Schema({
    femaleList: {
        type: Array,
        require: true,
        unique: true
    },
}, {
    timestamps: true
});


const FemaleListSchema = mongoose.model('FemaleListSchema', femaleListSchema);

module.exports = FemaleListSchema;