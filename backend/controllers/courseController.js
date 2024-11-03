const Course = require('../models/courseModel'); // Adjust the path as necessary
const fs = require('fs').promises; // For file operations
const Enrollment = require("../models/enrollmentModel")

async function addCourse(req, res) {
  try {
    console.log("+++++++++++++++++++++++++++++++");
    const { name, duration, description, price } = req.body;

    if (!req.files || !req.files.video || !req.files.pdf) {
      return res.status(400).json({ success: false, message: 'Video and PDF files are required' });
    }

    const videoFile = req.files.video[0];
    const pdfFile = req.files.pdf[0];

    const courseData = {
      name: name.trim(),
      duration: duration.trim(),
      description: description.trim(),
      price: parseFloat(price),
      video_url: videoFile.path.replace(/\\/g, '/'),
      pdf_path: pdfFile.path.replace(/\\/g, '/')
    };

    console.log('Course data:', courseData);

    // Use a Promise wrapper for the callback-based create method
    const createCourse = () => {
      return new Promise((resolve, reject) => {
        Course.create(courseData, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };

    const result = await createCourse();
    console.log('Database result:', JSON.stringify(result, null, 2));

    if (result && result.insertId) {
      res.status(201).json({
        success: true,
        message: 'Course added successfully',
        data: {
          id: result.insertId,
          ...courseData
        }
      });
    } else {
      throw new Error('Failed to create course: Database operation did not return expected result');
    }
  } catch (error) {
    if (req.files) {
      try {
        const filesToDelete = [
          req.files.video?.[0]?.path,
          req.files.pdf?.[0]?.path
        ].filter(Boolean);
        await Promise.all(filesToDelete.map(file => fs.unlink(file)));
      } catch (unlinkError) {
        console.error('Error deleting files:', unlinkError);
      }
    }
    console.error('Error in addCourse:', error);
    res.status(500).json({ success: false, message: 'Failed to add course', error: error.message });
  }
}

async function getAllCourses(req, res) {
  try {
    const getCourses = () => {
      return new Promise((resolve, reject) => {
        Course.getAll((err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
    };

    const courses = await getCourses();
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error('Error in getAllCourses:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve courses', error: error.message });
  }
}

async function getCourseById(req, res) {
  try {
    const { id } = req.params;

    const getCourse = () => {
      return new Promise((resolve, reject) => {
        Course.getById(id, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };

    const course = await getCourse();

    if (course) {
      res.status(200).json({ success: true, data: course });
    } else {
      res.status(404).json({ success: false, message: 'Course not found' });
    }
  } catch (error) {
    console.error('Error in getCourseById:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve course', error: error.message });
  }
}

async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updateCourseData = () => {
      return new Promise((resolve, reject) => {
        Course.update(id, updateData, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };

    const result = await updateCourseData();

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Course updated successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Course not found or no changes made' });
    }
  } catch (error) {
    console.error('Error in updateCourse:', error);
    res.status(500).json({ success: false, message: 'Failed to update course', error: error.message });
  }
}

async function deleteCourse(req, res) {
  try {
    const { id } = req.params;

    const deleteCourseData = () => {
      return new Promise((resolve, reject) => {
        Course.delete(id, (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };

    const result = await deleteCourseData();

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: 'Course deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Course not found' });
    }
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    res.status(500).json({ success: false, message: 'Failed to delete course', error: error.message });
  }
}




module.exports = {
  addCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};