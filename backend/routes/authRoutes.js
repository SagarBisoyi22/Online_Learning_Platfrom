// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController')
// console.log('authController:', authController);
// router.post('/register', authController.register);
// router.post('/login', authController.login);

// module.exports = router;



const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/reset-password', authController.resetPassword);

module.exports = router;
