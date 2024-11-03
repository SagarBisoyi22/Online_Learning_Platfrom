// Selectors for form elements
const signUpForm = document.querySelector('.sign-up-container form');
const loginForm = document.querySelector('.sign-in-container form');

// Event listener for the Sign Up form
signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const username = signUpForm.querySelector('input[type="text"]').value;
    const email = signUpForm.querySelector('input[type="email"]').value;
    const password = signUpForm.querySelector('input[type="password"]').value;
    console.log(username)
    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: username, email, password }), // Send name as username
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message); // Show success message
            signUpForm.reset(); // Reset the form
        } else {
            alert(data.error); // Show error message
        }
    } catch (error) {
        console.error('Error during registration:', error);
        alert('An error occurred. Please try again.');
    }
});

// Event listener for the Login form
loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log('Response data:', data); // Debug log

        // Your backend doesn't send a 'success' property
        // It sends a message and user object directly
        if (response.ok) { // Check if status is 200
            const { id, name, email } = data.user;

            // Store user info in localStorage
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userId', id);
            localStorage.setItem('userName', name);

            alert('Login successful!');
            window.location.href = 'dynamic_course.html';
        } else {
            // Handle error messages from backend
            alert('Login failed: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred. Please try again.');
    }
});