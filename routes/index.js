const express = require('express');
const cors = require('cors');
const router = express.Router();
const userController = require('../controllers/users_controller');  
const paymentController = require('../controllers/payment_controller');
const passport = require('passport');

router.use(express.json());
router.use(express.urlencoded({extended:false}));
router.use(cors());

console.log("Hare Krishna")

router.post('/login', passport.authenticate(
    'local',
    {failureRedirect: '/wrongCredential'},
), userController.loginUser);
router.post('/signup', userController.createUser);
router.post('/signup2', userController.userDetails);
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

module.exports = router ;