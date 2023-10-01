const user_credentials = require('../models/user_credentials');
const Razorpay = require('razorpay');

var instance = new Razorpay({ 
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports.createOrder = async (req, res) => {
    const userId = req.user.userId;

    const user = await user_credentials.findOne({userId: userId}, {name: 1, email: 1});
    
    var options = {
        amount: req.body.amount,
        currency: "INR",
        receipt: "rcp1"
    };
    instance.orders.create(options, function(err, order) {
        res.json({
            order,
            user
        })
    });
}

module.exports.verifyPayment = (req,res)=>{
    console.log("Verify payment");
  
    let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
   
    var crypto = require("crypto");
    var expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
        console.log("sig received " ,req.body.response.razorpay_signature);
        console.log("sig generated " ,expectedSignature);
    var response = {"signatureIsValid":"false"}
    if(expectedSignature === req.body.response.razorpay_signature)
      response={"signatureIsValid":"true"}
         res.send(response);
}