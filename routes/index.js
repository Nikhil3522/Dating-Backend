const express = require('express');
const cors = require('cors');
const router = express.Router();
const userController = require('../controllers/users_controller');  
const paymentController = require('../controllers/payment_controller');
const chatController = require('../controllers/chat_controller');
const passport = require('passport');
const http = require('http');


router.use(cors({
    origin: 'http://localhost:3000', // Update with the actual origin of your React.js app
    methods: ['GET', 'POST'],
    credentials: true // Allow credentials (e.g., cookies, authorization headers)
  }));

router.use(express.json());
router.use(express.urlencoded({extended:false}));

console.log("Hare Krishna")

router.post('/login', passport.authenticate(
    'local',
    {failureRedirect: '/wrongCredential'},
), userController.loginUser);
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    return res.status(201).json({ message: "Logout successfully" });
  });
});
router.post('/signup', userController.createUser);
router.post('/mailverify', userController.mailVerify);
router.post('/signup2', userController.userDetails);
router.post('/imageUpload', userController.imageUploader);
router.get('/wrongCredential', userController.wrongCredential);
router.post('/forgetPasswordOTP', userController.forgetPasswordOTP);
router.post('/forgetPasswordOTPVerify', userController.forgetPasswordOTPVerify);
router.post('/newPassword', userController.newPassword);
router.get('/mydetails', passport.checkAuthentication , userController.myDetail);
router.get('/myLike', passport.checkAuthentication , userController.myLike);
router.get('/home', passport.checkAuthentication , userController.home);
router.post('/getUserDetail/:profileId', passport.checkAuthentication, userController.getUserDetail);
router.post('/getProfileDetail/:profileId', passport.checkAuthentication, userController.getProfileDetail);
router.get('/like/:profileId', passport.checkAuthentication , userController.like);
router.post('/superLike/:profileId', passport.checkAuthentication, userController.superLike);
router.post('/nope/:profileId', passport.checkAuthentication, userController.nope);
router.post('/editProfile', passport.checkAuthentication, userController.editProfile);
router.post('/matchProfile/:profileId', passport.checkAuthentication, userController.matchProfile);
router.post('/notmatchProfile/:profileId', passport.checkAuthentication, userController.notmatchProfile);
router.post('/undomatchProfile/:profileId', passport.checkAuthentication, userController.undomatchProfile);
router.post('/block/:profileId', passport.checkAuthentication, userController.block);
router.post( '/create-order', passport.checkAuthentication, paymentController.createOrder);
router.post("/api/payment/verify", passport.checkAuthentication, paymentController.verifyPayment);
router.get('/chat/get-messages/:profileId/:page', passport.checkAuthentication, chatController.getMessages);
router.get('/chat/last-message/:profileId', passport.checkAuthentication, chatController.lastMessage);
router.post('/chat/send-message', passport.checkAuthentication, chatController.sendMessage);

module.exports = router ;