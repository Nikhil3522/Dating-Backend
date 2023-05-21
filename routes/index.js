const express = require('express');
const router = express.Router();
const userController = require('../controllers/users_controller');  
const passport = require('passport');

router.use(express.json());
router.use(express.urlencoded({extended:false}));

console.log("Hare Krishna")

router.post('/login', passport.authenticate(
    'local',
    {failureRedirect: '/wrongCredential'},
), userController.loginUser);
router.post('/signup', userController.createUser);
router.post('/signup2', userController.userDetails);
router.get('/wrongCredential', userController.wrongCredential);
router.get('/home', passport.checkAuthentication , userController.home);

module.exports = router ;