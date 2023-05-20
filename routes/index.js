const express = require('express');
const router = express.Router();
const userController = require('../controllers/users_controller');  

router.use(express.json());
router.use(express.urlencoded({extended:false}));

console.log("Hare Krishna")

// router.get('/login', )
router.post('/signup', userController.createUser);
router.post('/signup2', userController.userDetails);



module.exports = router ;