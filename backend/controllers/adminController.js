const AdminOrganizer = require('../models/adminModel');
const bcrypt = require('bcryptjs');

const registerOrganizer = (req, res) => {
    const { username, email, password } = req.body; // Changed 'name' to 'username'
    const hashedPassword = bcrypt.hashSync(password, 8);
    console.log('Registering user:', username, email); // Log registration info

    AdminOrganizer.create({ name: username, email, password: hashedPassword }, (err, result) => {
        if (err) {
            if (err.code === 11000) { // Duplicate key error
                return res.status(400).json({ error: 'Email already in use' });
            }
            console.error('Error registering user:', err); // Log the error
            return res.status(500).json({ error: 'Error registering user' });
        }
        return res.status(201).json({ message: 'User registered successfully', user: result });
    });
};

const loginOrganizer = (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)

    AdminOrganizer.findByEmail(email, (err, results) => {

        const user = results[0];
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        if (password !== user.password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        res.status(200).json({ message: 'admin logged in successfully' });
    });
};

module.exports = {
    registerOrganizer,
    loginOrganizer
};
