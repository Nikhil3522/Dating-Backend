const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: Number,
        require: true
    },
    amount: {
        type: Number,
        require: true
    },
    startDate: {
        type: Date,
        require: true
    },
    finalDate: {
        type: Date,
        require: true
    },
    packName: {
        type: String,
        require: true
    },
    response: {
        razorpay_order_id: {
            type: String,
            require: true            
        },
        razorpay_payment_id: {
            type: String,
            require: true        
        },
        razorpay_signature: {
            type: String,
            require: true        
        }
    }
},{
    timestamps: true
});

const SubscriptionSchema = mongoose.model('SubscriptionSchema', subscriptionSchema);
module.exports = SubscriptionSchema;