const user_credentials = require('../models/user_credentials');
const user_details = require('../models/user_details');
const subscription = require('../models/subscription');
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

module.exports.savePayment = async (req, res) => {
    const userId = req.user.userId;
    let body = req.body;

    const startDate = new Date();
    const finalDate = new Date(startDate);

    if(body.month == "one"){
        finalDate.setDate(startDate.getDate() + 30);
    }else if(body.month == "three"){
        finalDate.setDate(startDate.getDate() + 90);
    }else if(body.month == "six"){
        finalDate.setDate(startDate.getDate() + 180);
    }

    subscription.create({
        userId: userId,
        amount: body.amount,
        startDate: startDate,
        finalDate: finalDate,
        packName: body.packName,
        response: body.response
    });

    // user_details.updateOne({userId: userId}, { $set: {permission: 2}});

    try {
        console.log("userId", userId);
        const updatedDocument = await user_details.findOneAndUpdate(
          { userId: userId },
          { permission: 2 },
          { new: true }
        );
      
        if (!updatedDocument) {
          // Handle the case where the document with the specified userId was not found
          return res.status(404).json({ message: 'User not found' });
        }
      
        // Handle the updated document here
    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong in saving the payment!"
        })
    }
      


    res.status(200).json({
        success: true
    })
}