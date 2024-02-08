const express = require('express');
const cors = require('cors');
const router = express.Router();
const userController = require('../controllers/users_controller');  
const paymentController = require('../controllers/payment_controller');
const chatController = require('../controllers/chat_controller');
const http = require('http');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const secretKey = 'secretKey';
router.use(bodyParser.json());
router.use(cookieParser());
const user_credentials = require('../models/user_credentials');
const bcrypt = require('bcryptjs');



// Middleware function to check if the user is authenticated
const authenticateMiddleware = (req, res, next) => {
  // Get the token from the request headers
  const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : req.cookies.jwtToken;
  if (!token) {
    // Token is missing, unauthorized
    return res.status(401).json({ message: 'Unauthorized - Token missing' });
  }

  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      // Token is invalid, unauthorized
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    // Token is valid, user is authenticated
    req.user = decoded; // Attach user information to the request object
    next(); // Continue to the next middleware or route
  });
};

router.use(cors({
    origin: ['http://localhost:3000', 'https://www.dateuni.in'],
    methods: ['GET', 'POST'],
    credentials: true // Allow credentials (e.g., cookies, authorization headers)
  }));

router.use(express.json());
router.use(express.urlencoded({extended:false}));

router.post('/login', async (req, res) => {

  try{

    const {email, password} = req.body;
    const lowerCaseEmail = email.toLowerCase();
    const user = await user_credentials.findOne({ email: { $regex: new RegExp('^' + lowerCaseEmail + '$', 'i') } });
    const passwordMatch = await bcrypt.compare(password, user.password);

    if(user && passwordMatch){
      const tempUser = { userId: user.userId, username: user.name };
      const token = jwt.sign(tempUser, 'secretKey', { expiresIn: '1h' });
      res.cookie('jwtToken', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: (365 * 24 * 60 * 60 * 1000)
        // domain: '.your-domain.com', // Replace with your actual domain
      });

      // Set CORS headers
      res.header('Access-Control-Allow-Origin', 'https://www.dateuni.in');
    
      // Send a response indicating successful login
      return res.json({ message: 'User LoggedIN!', token });
    }else{
      return res.status(401).json({
        message: 'Wrong Email or Passwod!'
      })
    }

  }catch (error){
    console.log("Something went wrong in login");
    return res.status(401).json({
      message: 'Something went wrong!'
    })
  }

});

router.get('/test', (req, res) => {
  return res.status(201).json({ message: "API is working!" });
})

// router.post('/login', passport.authenticate(
//     'local',
//     {failureRedirect: '/wrongCredential'},
// ), userController.loginUser);
            
// router.get('/logout', (req, res) => {
//   req.logout((err) => {
//     if (err) {
//       return res.status(500).json({ message: "Logout failed" });
//     }
//     return res.status(201).json({ message: "Logout successfully" });
//   });
// });
router.get('/logout', (req, res) => {
  // Clear the JWT token cookie
  res.clearCookie('jwtToken', {
    secure: true,
    sameSite: 'none',
    // domain: '.your-domain.com', // Replace with your actual domain
  });

  return res.status(201).json({ message: "Logout successfully" });
});
router.post('/signup', userController.createUser);
router.post('/mailverify', userController.mailVerify);
router.post('/signup2', userController.userDetails);
router.post('/imageUpload', userController.imageUploader);
router.get('/wrongCredential', userController.wrongCredential);
router.post('/forgetPasswordOTP', userController.forgetPasswordOTP);
router.post('/forgetPasswordOTPVerify', userController.forgetPasswordOTPVerify);
router.post('/newPassword', userController.newPassword);
router.get('/mydetails', authenticateMiddleware , userController.myDetail);
router.get('/myLike', authenticateMiddleware , userController.myLike);
router.get('/myLikeCount', authenticateMiddleware , userController.myLikeCount)
router.get('/home', authenticateMiddleware , userController.home);
router.post('/getUserDetail/:profileId', authenticateMiddleware, userController.getUserDetail);
router.post('/getProfileDetail/:profileId', authenticateMiddleware, userController.getProfileDetail);
router.get('/like/:profileId', authenticateMiddleware , userController.like);
router.post('/superLike/:profileId', authenticateMiddleware, userController.superLike);
router.post('/nope/:profileId', authenticateMiddleware, userController.nope);
router.post('/editProfile', authenticateMiddleware, userController.editProfile);
router.post('/editProfile2', authenticateMiddleware, userController.editProfile2);
router.post('/matchProfile/:profileId', authenticateMiddleware, userController.matchProfile);
router.post('/notmatchProfile/:profileId', authenticateMiddleware, userController.notmatchProfile);
router.post('/undomatchProfile/:profileId', authenticateMiddleware, userController.undomatchProfile);
router.post('/block/:profileId', authenticateMiddleware, userController.block);
router.post( '/create-order', authenticateMiddleware, paymentController.createOrder);
router.post("/api/payment/verify", authenticateMiddleware, paymentController.verifyPayment);
router.post('/savepayment', authenticateMiddleware, paymentController.savePayment);
router.get('/chat/get-messages/:profileId/:page', authenticateMiddleware, chatController.getMessages);
router.get('/chat/last-message/:profileId', authenticateMiddleware, chatController.lastMessage);
router.post('/chat/send-message', authenticateMiddleware, chatController.sendMessage);

module.exports = router ;
