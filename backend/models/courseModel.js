const db = require('../config/db'); // Adjust the path as necessary

const Course = {
    create: (data, callback) => {
        const query = `
            INSERT INTO courses (
                name,
                duration,
                description,
                price,
                video_url,
                pdf_path
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.query(
            query,
            [
                data.name,
                data.duration,
                data.description,
                data.price,
                data.video_url,
                data.pdf_path
            ],
            callback
        );
    },

    getAll: (callback) => {
        const query = 'SELECT * FROM courses';
        db.query(query, callback);
    },

    getById: (id, callback) => {
        const query = 'SELECT * FROM courses WHERE id = ?';
        db.query(query, [id], callback);
    },

    update: (id, data, callback) => {
        const query = `
            UPDATE course
            SET name = ?,
                duration = ?,
                description = ?,
                price = ?,
                video_url = ?,
                pdf_path = ?
            WHERE id = ?
        `;

        db.query(
            query,
            [
                data.name,
                data.duration,
                data.description,
                data.price,
                data.video_url,
                data.pdf_path,
                id
            ],
            callback
        );
    },

    delete: (id, callback) => {
        const query = 'DELETE FROM courses WHERE id = ?';

        console.log('Executing delete for course ID:', id); // Log the ID being deleted
        db.query(query, [id], (err, result) => {
            if (err) {
                console.error('Error executing delete query:', err); // Log any errors
                return callback(err); // Return error through callback
            }

            // Log the result of the deletion
            console.log('Delete result:', result);
            callback(null, result); // Return result through callback
        });
    }
};

module.exports = Course;