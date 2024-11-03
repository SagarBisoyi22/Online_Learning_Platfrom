document.addEventListener('DOMContentLoaded', () => {
  const addCourseButton = document.getElementById('add-course');
  const logoutButton = document.getElementById('logout');
  const form = document.getElementById('cardForm');
  const courseList = document.getElementById('courseList');

  // Initial card data structure
  let cardData = {
    name: '',
    duration: 8,
    description: '',
    price: 2499,
    video: '',
    pdf: ''
  };

  function renderCard(data) {
    const courseItem = document.createElement('li');
    courseItem.classList.add('course-card');

    courseItem.innerHTML = `
      <div class="card-content">
        <h3 class="card-title">${data.name}</h3>
        <p><strong>Duration:</strong> ${data.duration} weeks</p>
        <p><strong>Description:</strong> ${data.description}</p>
        <p><strong>Price:</strong> INR ${data.price}</p>
        <p><strong>Video:</strong> <a href="${data.video}" target="_blank">View Video</a></p>
        <p><strong>PDF:</strong> <a href="${data.pdf}" target="_blank">View PDF</a></p>
      </div>
    `;

    courseList.appendChild(courseItem);
  }

  // Handle form submission for adding a course
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    // Collect values from the form inputs
    const name = document.getElementById('name').value.trim();
    const weeks = parseInt(document.getElementById('weeks').value);
    const description = document.getElementById('description').value.trim();
    const price = parseFloat(document.getElementById('price').value);
    const videoFile = document.getElementById('video').files[0];
    const pdfFile = document.getElementById('pdf').files[0];

    // Validate form data
    if (!name) {
      alert('Please fill in the Course Name.');
      return;
    }
    if (isNaN(weeks) || weeks <= 0) {
      alert('Please enter a valid Duration (in weeks).');
      return;
    }
    if (!description) {
      alert('Please fill in the Course Description.');
      return;
    }
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid Price.');
      return;
    }
    if (!videoFile) {
      alert('Please provide a Video file.');
      return;
    }
    if (!pdfFile) {
      alert('Please provide a PDF file.');
      return;
    }

    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('name', name);
    formData.append('duration', weeks);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('video', videoFile);
    formData.append('pdf', pdfFile);

    // Send the course data to the backend
    fetch('http://localhost:3000/api/courses/add', {
      method: 'POST',
      body: formData
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to send course data');
        }
        return response.json();
      })
      .then(result => {
        console.log('Course successfully created:', result);

        // Create object for rendering
        const cardData = {
          name: name,
          duration: weeks,
          description: description,
          price: price,
          video: URL.createObjectURL(videoFile),
          pdf: URL.createObjectURL(pdfFile)
        };

        // Render the new card locally
        renderCard(cardData);

        // Reset the form
        form.reset();

        // Show success alert
        alert('Course successfully created!');
      })
      .catch(error => {
        console.error('Error sending course data:', error);
        alert('Error creating course. Please try again.');
      });
  });

  // Fetch and display existing courses from the backend
  // fetch('http://localhost:3000/api/courses/all')
  // .then(response => {
  //   if (!response.ok) {
  //     throw new Error('Failed to fetch courses');
  //   }
  //   return response.json();
  // })
  // .then(data => {
  //   console.log('Fetched courses data:', data); // Add this line to inspect the data
  //   // Check if the data is an array
  //   if (Array.isArray(data)) {
  //     // Clear any existing content in the course list
  //     courseList.innerHTML = '';
  //     // Render each course retrieved from the backend
  //     data.forEach(course => renderCard(course));
  //   } else {
  //     console.error('Data is not an array:', data);
  //   }
  // })
  // .catch(error => {
  //   console.error('Error fetching courses:', error);
  // });

});
