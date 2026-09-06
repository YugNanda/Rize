const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { uploadResume: multerResume, uploadPhoto: multerPhoto } = require('../middleware/upload.middleware');
const {
  getMyProfile, updateProfile, uploadResume, uploadPhoto,
  getStudentById, getAllStudents, verifyStudent, issueStudentNoc,
} = require('../controllers/student.controller');

const router = express.Router();

// All student routes require authentication
router.use(protect);

// Student's own profile
router.get('/profile', authorize('student'), getMyProfile);
router.put('/profile', authorize('student'), updateProfile);
router.post('/resume', authorize('student'), multerResume.single('resume'), uploadResume);
router.post('/photo', authorize('student'), multerPhoto.single('photo'), uploadPhoto);

// Admin / T&P Cell routes
router.get('/', authorize('admin', 'tpcell'), getAllStudents);
router.get('/:id', authorize('admin', 'company', 'tpcell'), getStudentById);
router.patch('/:id/verify', authorize('admin', 'tpcell'), verifyStudent);
router.patch('/:id/noc', authorize('admin', 'tpcell'), issueStudentNoc);

module.exports = router;
