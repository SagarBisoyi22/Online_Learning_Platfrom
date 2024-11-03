const express = require('express');
const router = express.Router();
const EnrollmentController = require('../controllers/enrollmentController');



// Enrollment routes without auth middleware
router.post('/enroll', EnrollmentController.createEnrollment);
router.post('/get-enrollment', EnrollmentController.getEnrollment);

module.exports = router;
