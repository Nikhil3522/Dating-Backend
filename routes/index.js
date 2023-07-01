const express = require('express');
const cors = require('cors');
const router = express.Router();
const userController = require('../controllers/users_controller');  
const paymentController = require('../controllers/payment_controller');
const chatController = require('../controllers/chat_controller');
const passport = require('passport');

router.use(express.json());
router.use(express.urlencoded({extended:false}));
router.use(cors({
    origin: 'http://localhost:3000', // Update with the actual origin of your React.js app
    credentials: true // Allow credentials (e.g., cookies, authorization headers)
  }));

console.log("Hare Krishna")

router.post('/login', passport.authenticate(
    'local',
    {failureRedirect: '/wrongCredential'},
), userController.loginUser);
router.post('/signup', userController.createUser);
router.post('/mailverify', userController.mailVerify);
router.post('/signup2', userController.userDetails);
router.post('/imageUpload', userController.imageUploader);
router.get('/wrongCredential', userController.wrongCredential);
router.get('/home', passport.checkAuthentication , userController.home);
router.post('/like/:profileId', passport.checkAuthentication , userController.like);
router.post('/superLike/:profileId', passport.checkAuthentication, userController.superLike);
router.post('/nope/:profileId', passport.checkAuthentication, userController.nope);
router.post('/editProfile', passport.checkAuthentication, userController.editProfile);
router.post('/matchProfile/:profileId', passport.checkAuthentication, userController.matchProfile);
router.post('/notmatchProfile/:profileId', passport.checkAuthentication, userController.notmatchProfile);
router.post('/undomatchProfile/:profileId', passport.checkAuthentication, userController.undomatchProfile);
router.post('/block/:profileId', passport.checkAuthentication, userController.block);
router.get( '/create-order', paymentController.createOrder);
router.post("/api/payment/verify", paymentController.verifyPayment);
router.get('/chat/get-messages/:userId', passport.checkAuthentication, chatController.getMessages);
router.post('/chat/send-message', passport.checkAuthentication, chatController.sendMessage);

module.exports = router ;