const express = require('express');
const router = express.Router();
const { registerOrganizer, loginOrganizer } = require('../controllers/adminController');

router.post('/register', registerOrganizer);
router.post('/login', loginOrganizer);

module.exports = router;
