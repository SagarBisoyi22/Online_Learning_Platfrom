const db = require('../config/db');

const Enrollment = {
    create: (data) => {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO enrollment (course_id, user_id, price, status) VALUES (?, ?, ?, ?)`;
            db.query(query, [data.course_id, data.user_id, data.price, data.status], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    },
    findOne: (user_id, course_id) => {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM enrollment WHERE user_id = ? AND course_id = ? LIMIT 1`;
            db.query(query, [user_id, course_id], (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result[0] || null);
            });
        });
    },
    deleteByCourseId: (courseId) => {  // Changed to match the Promise pattern
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM enrollment WHERE course_id = ?';  // Changed 'enrollments' to 'enrollment' to match your table name

            console.log('Executing SQL query:', query, 'with courseId:', courseId);

            db.query(query, [courseId], (err, result) => {
                console.log('Inside db.query callback');
                if (err) {
                    console.error('Database error:', err);
                    return reject(err);
                }
                console.log('Query result:', result);
                return resolve(result);
            });

            console.log('After db.query execution');
        });
    }
};

module.exports = Enrollment;