const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const {
  scheduleInterview,
  getMyInterviews,
  getCompanyInterviews,
  getDriveInterviews,
  updateInterview,
  deleteInterview,
} = require('../controllers/interview.controller');

const router = express.Router();

router.use(protect);

router.get('/my', authorize('student'), getMyInterviews);
router.get('/company', authorize('company'), getCompanyInterviews);
router.get('/drive/:driveId', authorize('company', 'admin', 'tpcell'), getDriveInterviews);
router.post('/', authorize('company', 'admin', 'tpcell'), scheduleInterview);
router.patch('/:id', authorize('company', 'admin', 'tpcell'), updateInterview);
router.delete('/:id', authorize('company', 'admin', 'tpcell'), deleteInterview);

module.exports = router;
