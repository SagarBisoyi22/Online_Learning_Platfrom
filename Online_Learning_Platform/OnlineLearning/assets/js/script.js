'use strict';

/**
 * Utility function to add events on element(s)
 * @param {Element|NodeList} elem - DOM element or NodeList
 * @param {string} type - Event type
 * @param {Function} callback - Event handler
 */
const addEventOnElem = function (elem, type, callback) {
  if (elem instanceof NodeList) {
    elem.forEach(element => element.addEventListener(type, callback));
  } else if (elem) {
    elem.addEventListener(type, callback);
  }
};

/**
 * Navigation functionality
 */
const initializeNavigation = () => {
  const navbar = document.querySelector("[data-navbar]");
  const navTogglers = document.querySelectorAll("[data-nav-toggler]");
  const navLinks = document.querySelectorAll("[data-nav-link]");
  const overlay = document.querySelector("[data-overlay]");

  if (!navbar || !overlay) return;

  const toggleNavbar = () => {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
  };

  const closeNavbar = () => {
    navbar.classList.remove("active");
    overlay.classList.remove("active");
  };

  addEventOnElem(navTogglers, "click", toggleNavbar);
  addEventOnElem(navLinks, "click", closeNavbar);
};

/**
 * Header scroll functionality
 */
const initializeHeaderScroll = () => {
  const header = document.querySelector("[data-header]");
  const backTopBtn = document.querySelector("[data-back-top-btn]");

  if (!header || !backTopBtn) return;

  const toggleActiveElements = () => {
    const shouldBeActive = window.scrollY > 100;
    header.classList.toggle("active", shouldBeActive);
    backTopBtn.classList.toggle("active", shouldBeActive);
  };

  addEventOnElem(window, "scroll", toggleActiveElements);
};

const enrollmentSystem = {
  enrolledCourses: new Set(),

  async initialize() {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }
      console.log('User ID:', userId);
      this.enrolledCourses.clear();

      const request = new Request('http://localhost:3000/enrollment/get-enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_id: userId })
      });

      const response = await fetch(request);
      console.log('Fetch response:', response);

      if (!response.ok) {
        throw new Error('Failed to fetch enrolled courses');
      }

      const enrollments = await response.json();
      console.log('Enrollments data:', enrollments);
      if (!enrollments || !enrollments.data) {
        console.warn('Invalid enrollment data structure:', enrollments);
        return;
      }
      // Safely extract course IDs from the enrollment data
      const enrolledCourseIds = enrollments.data.map(enrollment => {
        // Check for different possible properties that might contain the course ID
        const courseId = enrollment.courseId || enrollment.course_id || enrollment.id;
        if (courseId === undefined || courseId === null) {
          console.warn('Missing course ID in enrollment:', enrollment);
          return null;
        }
        return courseId.toString();
      }).filter(id => id !== null); // Remove any null values

      // Update the enrolled courses Set
      this.enrolledCourses = new Set(enrolledCourseIds);

      console.log('Processed enrolled courses:', [...this.enrolledCourses]);

      // Store in localStorage as strings
      localStorage.setItem('enrolledCourses',
        JSON.stringify([...this.enrolledCourses])
      );

      console.log('Updated enrolled courses:', this.enrolledCourses);

      this.updateEnrollmentButtons();
      this.displayEnrolledCourses(enrollments.data);
    } catch (error) {
      console.error('Error initializing enrollment system:', error);
    }
  },

  displayEnrolledCourses(courses) {
    const coursesList = document.getElementById('enrolledCoursesList');

    if (!coursesList) {
      console.error('Enrolled courses list container not found');
      return;
    }

    coursesList.innerHTML = '';

    if (!courses || courses.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'enrolled-courses-empty';
      emptyDiv.innerHTML = `
        <div class="empty-state" style="text-align: center; padding: 40px; background: #f9f9f9; border-radius: 8px;">
          <h4 style="color: #666; margin-bottom: 10px;">No Courses Enrolled Yet</h4>
          <p style="color: #888;">Browse our existing courses and enroll to start learning!</p>
        </div>
      `;
      coursesList.appendChild(emptyDiv);
      return;
    }

    courses.forEach(course => {
      const li = document.createElement('li');
      li.className = 'enrolled-course-item';
      li.innerHTML = `
        <div class="card-content" style="
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          background-color: #f9f9f9;
          margin-bottom: 15px;
        ">
          <h4 class="card-title" style="font-size: 1.5em; color: #000; margin: 0 0 10px 0;">${course.name}</h4>
          <p class="card-text" style="font-size: 1em; color: #666;">${course.description || 'No description available'}</p>
          <div class="card-meta" style="display: flex; justify-content: space-between; margin-top: 15px;">
            <div class="badge" style="display: flex; align-items: center;">
              <ion-icon name="time-outline" style="margin-right: 5px;"></ion-icon>
              <span style="font-weight: bold;">${course.duration} weeks</span>
            </div>
            <div class="badge" style="display: flex; align-items: center;">
              <ion-icon name="people-outline" style="margin-right: 5px;"></ion-icon>
              <span style="font-weight: bold; color: red;">${course.price}$</span>
            </div>
          </div>
        </div>
      `;
      coursesList.appendChild(li);
    });
  },

  updateEnrollmentButtons() {
    const enrollButtons = document.querySelectorAll('.enroll-btn');
    enrollButtons.forEach(button => {
      const courseId = button.getAttribute('data-course-id');
      if (this.isEnrolled(courseId)) {
        button.textContent = 'Enrolled';
        button.classList.add('enrolled');
        button.disabled = true;
      }
    });
  },

  isEnrolled(courseId) {
    // Convert courseId to string for comparison
    console.log(courseId)
    if (!courseId) return false;
    const stringId = courseId.toString();
    const isEnrolled = this.enrolledCourses.has(stringId);
    console.log(`Checking enrollment for course ${stringId}: ${isEnrolled}`);
    return isEnrolled;
  },

  async enrollCourse(courseId, button) {
    if (this.isEnrolled(courseId)) {
      return;
    }

    try {
      button.disabled = true;
      button.textContent = 'Enrolling...';

      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const response = await fetch('http://localhost:3000/enrollment/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to enroll');
      }

      const enrollmentData = await response.json();

      this.enrolledCourses.add(courseId.toString());
      localStorage.setItem('enrolledCourses', JSON.stringify([...this.enrolledCourses]));

      button.textContent = 'Enrolled';
      button.classList.add('enrolled');
      button.disabled = true;

      // Refresh the enrolled courses display
      await this.initialize();

      this.showMessage('Successfully enrolled in the course!', 'success');

    } catch (error) {
      console.error('Error enrolling in course:', error);
      button.disabled = false;
      button.textContent = 'Enroll Now';
      this.showMessage(error.message || 'Failed to enroll in course. Please try again.', 'error');
    }
  },

  showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '10px 20px';
    messageDiv.style.borderRadius = '4px';
    messageDiv.style.zIndex = '1000';

    switch (type) {
      case 'success':
        messageDiv.style.backgroundColor = '#4CAF50';
        messageDiv.style.color = 'white';
        break;
      case 'error':
        messageDiv.style.backgroundColor = '#f44336';
        messageDiv.style.color = 'white';
        break;
      default:
        messageDiv.style.backgroundColor = '#2196F3';
        messageDiv.style.color = 'white';
    }

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }
};

// Add necessary styles
const styles = `
  .enrolled-course-item {
    list-style: none;
    margin-bottom: 20px;
  }

  .enrolled-course-item .card-content:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
  }

  .message {
    transition: opacity 0.3s ease;
  }
`;


/**
 * Course management functionality
 */
const initializeCourseManagement = () => {
  const courseContainer = document.getElementById('existingCoursesList');

  const handleEnrollmentClick = async (event) => {
    const button = event.target;
    if (!button.classList.contains('enroll-btn')) return;

    const courseId = button.getAttribute('data-course-id');
    if (courseId) {
      await enrollmentSystem.enrollCourse(courseId, button);
    }
  };

  if (courseContainer) {
    courseContainer.addEventListener('click', handleEnrollmentClick);
  }

  const createCourseCard = (course) => {
    const {
      name = 'Untitled Course',
      duration = 'N/A',
      price = 0,
      id = '',
      level = 'Not specified',
      lessons = 0,
      video_url,
      pdf_path
    } = course;

    // Convert id to string and check enrollment status
    const isEnrolled = enrollmentSystem.isEnrolled(id.toString());
    const enrollButtonClass = isEnrolled ? 'enroll-btn enrolled' : 'enroll-btn';
    const enrollButtonText = isEnrolled ? 'Enrolled' : 'Enroll Now';
    const enrollButtonDisabled = isEnrolled ? 'disabled' : '';

    const videoSection = video_url ? `
      <div class="media-section">
        <div class="video-thumbnail" onclick="toggleVideo('${id}')">
          <ion-icon name="play-circle-outline"></ion-icon>
          <span>Click to view video</span>
        </div>
        <div id="video-container-${id}" class="video-container" style="display:none;">
          <div class="video-wrapper">
            <div class="video-controls">
              <button onclick="closeVideo('${id}')" class="close-video">
                <ion-icon name="close-outline"></ion-icon>
              </button>
            </div>
            <video class="video-player" controls>
              <source src="${video_url}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    ` : '';

    const pdfSection = pdf_path ? `
      <div class="media-section">
        <div class="pdf-thumbnail" onclick="openPDF('${pdf_path}', '${name}')">
          <ion-icon name="document-text-outline"></ion-icon>
          <span>Click to view PDF</span>
        </div>
      </div>
    ` : '';

    return `
      <li>
        <div class="course-card existing-course-card">
          <div class="abs-badge">
            <ion-icon name="time-outline" aria-hidden="true"></ion-icon>
            <span class="span">${duration}week</span>
          </div>
          <div class="card-content">
            <span class="badge">${level}</span>
            <h3 class="h3">
              <a href="#" class="card-title">${name}</a>
            </h3>
            <p>Price in INR: <data class="price" value="${price}">₹${price}</data></p>
            ${videoSection}
            ${pdfSection}
            <ul class="card-meta-list">
              <li class="card-meta-item">
                <button class="${enrollButtonClass}"
                        data-course-id="${id}"
                        ${enrollButtonDisabled}>${enrollButtonText}</button>
              </li>
            </ul>
          </div>
        </div>
      </li>
    `;
  };


  const fetchCourses = async () => {
    if (!courseContainer) {
      console.error('Course container element not found');
      return;
    }

    courseContainer.innerHTML = '<div class="loading">Loading courses...</div>';

    try {
      // First initialize enrollment system to get enrolled courses
      await enrollmentSystem.initialize();

      console.log('Fetching courses...');

      const response = await fetch('http://localhost:3000/api/courses/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Response received:', response);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!responseData.success) throw new Error('API returned unsuccessful response');

      const courses = responseData.data;
      if (!Array.isArray(courses)) throw new Error('Invalid data format: courses is not an array');

      courseContainer.innerHTML = courses.length ?
        courses.map(course => createCourseCard(course)).join('') :
        '<div class="no-courses">No courses available</div>';

      // Update enrollment buttons after rendering courses
      enrollmentSystem.updateEnrollmentButtons();

    } catch (error) {
      console.error('Error fetching courses:', error);
      courseContainer.innerHTML = `<div class="error">Failed to load courses: ${error.message}</div>`;
    }
  };

  // Initialize courses
  fetchCourses();

  // Media handling functions - make them globally available
  window.toggleVideo = (courseId) => {
    const videoContainer = document.getElementById(`video-container-${courseId}`);
    if (!videoContainer) return;

    videoContainer.style.display = 'block';
    document.body.style.overflow = 'hidden';

    const escListener = (e) => {
      if (e.key === 'Escape') {
        window.closeVideo(courseId);
        document.removeEventListener('keydown', escListener);
      }
    };
    document.addEventListener('keydown', escListener);
  };

  window.closeVideo = (courseId) => {
    const videoContainer = document.getElementById(`video-container-${courseId}`);
    if (!videoContainer) return;

    const videoPlayer = videoContainer.querySelector('video');
    if (videoPlayer) videoPlayer.pause();

    videoContainer.style.display = 'none';
    document.body.style.overflow = '';
  };

  window.openPDF = (pdfUrl, courseName) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
};

/**
 * Add necessary styles
 */
const addStyles = () => {
  const styles = `
    .video-container {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      display: none;
    }

    .video-wrapper {
      position: relative;
      width: 80%;
      max-width: 900px;
      margin: 40px auto;
      background: #000;
    }

    .video-controls {
      position: absolute;
      top: -40px;
      right: 0;
      z-index: 1001;
    }

    .close-video {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 5px;
    }

    .video-player {
      width: 100%;
      max-height: 80vh;
    }

    .media-section {
      margin: 15px 0;
    }

    .video-thumbnail, .pdf-thumbnail {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: #f5f5f5;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .video-thumbnail:hover, .pdf-thumbnail:hover {
      background: #e0e0e0;
    }

    .video-thumbnail ion-icon, .pdf-thumbnail ion-icon {
      font-size: 24px;
      color: #666;
    }

    .enroll-btn {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      background-color: #4CAF50;
      color: white;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .enroll-btn:hover {
      background-color: #45a049;
    }

    .enroll-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }

    .enroll-btn.enrolled {
      background-color: #2196F3;
    }

    .enroll-btn.enrolled:hover {
      background-color: #1976D2;
    }

    .loading {
      text-align: center;
      padding: 20px;
      font-size: 1.2em;
      color: #666;
    }

    .error {
      text-align: center;
      padding: 20px;
      color: #f44336;
      background: #ffebee;
      border-radius: 4px;
    }

    .no-courses {
      text-align: center;
      padding: 40px;
      color: #666;
      font-size: 1.2em;
    }

    .course-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

  `;

  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
};

const initializeSearch = () => {
  const searchInput = document.getElementById('searchInput');
  const searchButton = document.getElementById('searchButton');
  const coursesList = document.getElementById('existingCoursesList');

  const filterCourses = () => {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const courseCards = coursesList.querySelectorAll('li');
    let hasVisibleCourses = false;

    courseCards.forEach(card => {
      const courseTitle = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
      const courseLevel = card.querySelector('.badge')?.textContent.toLowerCase() || '';
      const coursePrice = card.querySelector('.price')?.textContent.toLowerCase() || '';

      // Check if search term matches title, level, or price
      const matches = courseTitle.includes(searchTerm) ||
        courseLevel.includes(searchTerm) ||
        coursePrice.includes(searchTerm);

      // Show/hide card based on match
      card.style.display = matches ? 'block' : 'none';
      if (matches) hasVisibleCourses = true;
    });

    // Handle no results message
    let noResultsMsg = coursesList.querySelector('.no-results');
    if (!hasVisibleCourses && searchTerm !== '') {
      if (!noResultsMsg) {
        noResultsMsg = document.createElement('li');
        noResultsMsg.className = 'no-results';
        noResultsMsg.innerHTML = `
          <div class="text-center p-4">
            <h4 class="text-lg text-gray-600 mb-2">No courses found</h4>
            <p class="text-gray-500">Try adjusting your search terms or browse all courses.</p>
          </div>
        `;
        coursesList.appendChild(noResultsMsg);
      }
    } else if (noResultsMsg) {
      noResultsMsg.remove();
    }
  };

  // Add event listeners for both input changes and search button clicks
  searchInput.addEventListener('input', filterCourses);
  searchButton.addEventListener('click', filterCourses);

  // Add enter key support
  searchInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      filterCourses();
    }
  });

  // Initialize search on page load
  filterCourses();
};

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  addStyles();
  initializeNavigation();
  initializeHeaderScroll();
  initializeCourseManagement();
  enrollmentSystem.initialize();
  initializeSearch();
});