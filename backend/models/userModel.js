const db = require('../config/db');

const User = {
    create: (data, callback) => {
        const query = `INSERT INTO user (username, email, password) VALUES (?, ?, ?)`;
        db.query(query, [data.username, data.email, data.password], callback);
    },
    findByEmail: (email, callback) => {
        const query = `SELECT * FROM user WHERE email = ?`;
        db.query(query, [email], callback);
    }
};

module.exports = User;
