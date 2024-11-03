const db = require('../config/db');

const AdminOrganizer = {
    create: (data, callback) => {
        const query = `INSERT INTO admin (name, email, password) VALUES (?, ?, ?)`;
        db.query(query, [data.name, data.email, data.password], callback);
    },
    findByEmail: (email, callback) => {
        const query = `SELECT * FROM admin WHERE email = ?`;
        db.query(query, [email], callback);
    }
};

module.exports = AdminOrganizer;
