const express = require('express');
const multer = require('multer');
const path = require('path');
const courseController = require('../controllers/courseController');
const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Use path.join to create proper absolute paths
        const baseUploadPath = path.join(__dirname, '../uploads');
        const uploadDir = file.fieldname === 'video'
            ? path.join(baseUploadPath, 'videos')
            : path.join(baseUploadPath, 'pdfs');
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Rest of your code remains the same...
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'video') {
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid video file format'), false);
        }
    } else if (file.fieldname === 'pdf') {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid PDF file format'), false);
        }
    } else {
        cb(new Error('Unexpected field'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    }
});

router.post('/add', (req, res, next) => {
    upload.fields([
        { name: 'video', maxCount: 1 },
        { name: 'pdf', maxCount: 1 }
    ])(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                error: true,
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            return res.status(500).json({
                error: true,
                message: `Unknown error: ${err.message}`
            });
        }
        next();
    });
}, courseController.addCourse);
router.get('/all', courseController.getAllCourses);
router.delete('/delete/:id', courseController.deleteCourse)
module.exports = router;