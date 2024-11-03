// const User = require('../models/userModel');
// const bcrypt = require('bcryptjs');

// const register = (req, res) => {
//     const { username, email, password } = req.body; // Changed 'name' to 'username'
//     console.log(username,"--------------------")
//     const hashedPassword = bcrypt.hashSync(password, 8);
//     console.log('Registering user:', username, email); // Log registration info

//     User.create({ username: username, email, password: hashedPassword }, (err, result) => {
//         if (err) {
//             if (err.code === 11000) { // Duplicate key error 
//                 return res.status(400).json({ error: 'Email already in use' });
//             }
//             console.error('Error registering user:', err); // Log the error
//             return res.status(500).json({ error: 'Error registering user' });
//         }
//         return res.status(201).json({ message: 'User registered successfully', user: result });
//     });
// };


// const login = (req, res) => {
//     const { email, password } = req.body;
//     console.log(email,password)

//     User.findByEmail(email, (err, results) => {

//         const user = results[0];
//         if (err || !user) return res.status(404).json({error:'User not found'});

//         const isValidPassword = bcrypt.compareSync(password, user.password);
//         if (!isValidPassword) return res.status(401).json({error:'Invalid password'});
//         const { id, name } = user;
//         res.status(200).json({
//             message: 'User logged in successfully',
//             user: {
//                 id,
//                 name,
//                 email
//             }
//         });
//     });
// };

// module.exports = {
//     register,
//     login
// };



const User = require('../models/userModel');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

const register = (req, res) => {
    const { username, email, password } = req.body; // Changed 'name' to 'username'
    console.log(username, "--------------------")
    const hashedPassword = bcrypt.hashSync(password, 8);
    console.log('Registering user:', username, email); // Log registration info

    User.create({ username: username, email, password: hashedPassword }, (err, result) => {
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


const login = (req, res) => {
    const { email, password } = req.body;
    console.log(email, password)

    User.findByEmail(email, (err, results) => {

        const user = results[0];
        if (err || !user) return res.status(404).json({ error: 'User not found' });

        const isValidPassword = bcrypt.compareSync(password, user.password);
        if (!isValidPassword) return res.status(401).json({ error: 'Invalid password' });
        const { id, name } = user;
        res.status(200).json({
            message: 'User logged in successfully',
            user: {
                id,
                name,
                email
            }
        });
    });
};

const verifyEmail = (req, res) => {
    const { email } = req.body;
    User.findByEmail(email, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!results.length) return res.status(404).json({ error: 'Email not registered' });
        res.status(200).json({ message: 'Email verified, proceed to reset password' });
    });
};

// Step 2: Reset the password
const resetPassword = (req, res) => {
    const { email, newPassword } = req.body;
    const hashedPassword = bcrypt.hashSync(newPassword, 8);

    const query = `UPDATE user SET password = ? WHERE email = ?`;
    db.query(query, [hashedPassword, email], (err, result) => {
        if (err) return res.status(500).json({ error: 'Error updating password' });
        if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
        res.status(200).json({ message: 'Password reset successful' });
    });
};

module.exports = {
    register,
    login,
    verifyEmail,
    resetPassword
};