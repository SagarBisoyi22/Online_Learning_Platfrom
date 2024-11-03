const Enrollment = require('../models/enrollmentModel');
const db = require('../config/db');
const Course = require('../models/courseModel');
const enrollmentController = {
    async createEnrollment(req, res) {
        try {
            const { course_id, user_id } = req.body;
            console.log(course_id, user_id);

            // Input validation
            if (!course_id || !user_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid course ID or user ID'
                });
            }

            // Convert to integers
            const courseId = parseInt(course_id);
            const userId = parseInt(user_id);

            // Check if enrollment exists - Modified this part
            const checkExistingEnrollment = () => {
                return new Promise((resolve, reject) => {
                    const query = 'SELECT id FROM enrollment WHERE course_id = ? AND user_id = ? AND status = "active"';
                    db.query(query, [courseId, userId], (err, result) => {
                        if (err) return reject(err);
                        resolve(result[0]);
                    });
                });
            };

            const existingEnrollment = await checkExistingEnrollment();

            if (existingEnrollment) {
                return res.status(400).json({
                    success: false,
                    message: 'Already enrolled in this course'
                });
            }

            // Get course details
            const getCourse = () => {
                return new Promise((resolve, reject) => {
                    const query = 'SELECT id, price, name FROM courses WHERE id = ?';
                    db.query(query, [courseId], (err, result) => {
                        if (err) return reject(err);
                        resolve(result[0]);
                    });
                });
            };

            const course = await getCourse();
            if (!course) {
                return res.status(404).json({
                    success: false,
                    message: 'Course not found or inactive'
                });
            }

            // Create enrollment
            const enrollmentData = {
                course_id: courseId,
                user_id: userId,
                price: course.price,
                status: 'active'
            };

            const createNewEnrollment = () => {
                return new Promise((resolve, reject) => {
                    const query = 'INSERT INTO enrollment SET ?';
                    db.query(query, [enrollmentData], (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });
            };

            const result = await createNewEnrollment();

            return res.status(201).json({
                success: true,
                message: 'Successfully enrolled in the course',
                data: {
                    enrollment_id: result.insertId,
                    course_id: courseId,
                    user_id: userId,
                    course_name: course.name,
                    price: course.price,
                    status: 'active',
                    enrolled_at: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Enrollment error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create enrollment',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    },


    async getEnrollment(req, res) {
        try {
            const { user_id } = req.body;
            const userId = parseInt(user_id);

            if (!userId || isNaN(userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid user ID'
                });
            }

            // Fetch enrollments with course details using JOIN
            const query = `
                SELECT
                    e.*,
                    c.name,
                    c.description,
                    c.duration,
                    c.video_url,
                    c.pdf_path
                FROM enrollment e
                INNER JOIN courses c ON e.course_id = c.id
                WHERE e.user_id = ?
            `;

            const enrollments = await new Promise((resolve, reject) => {
                db.query(query, [userId], (error, results) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(results);
                });
            });

            if (!enrollments || enrollments.length === 0) {
                return res.status(200).json({
                    success: true,
                    data: []
                });
            }

            // Map the results to the desired format
            const formattedCourses = enrollments.map(enrollment => ({
                id: enrollment.id,
                name: enrollment.name,
                description: enrollment.description,
                duration: enrollment.duration,
                price: enrollment.price,
                videoUrl: enrollment.video_url,
                pdfUrl: enrollment.pdf_path,
                enrolled_at: enrollment.created_at,
                status: enrollment.status
            }));

            return res.status(200).json({
                success: true,
                data: formattedCourses
            });

        } catch (error) {
            console.error('Get enrollment error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch enrollment',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
};

module.exports = enrollmentController;