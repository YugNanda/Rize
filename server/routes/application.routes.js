const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const {
  applyToDrive, getMyApplications, getDriveApplications, getCompanyApplications,
  updateApplicationStatus, withdrawApplication, getStats,
  getAllApplications, updateApplicationNoc, getOfferLetter,
} = require('../controllers/application.controller');

const router = express.Router();

router.use(protect);

router.get('/my', authorize('student'), getMyApplications);
router.get('/company', authorize('company'), getCompanyApplications);
router.get('/stats', authorize('admin', 'tpcell'), getStats);
router.get('/', authorize('admin', 'tpcell'), getAllApplications);
router.get('/:id/offer-letter', authorize('student', 'company', 'admin', 'tpcell'), getOfferLetter);
router.post('/drives/:driveId', authorize('student'), applyToDrive);
router.get('/drives/:driveId', authorize('company', 'admin', 'tpcell'), getDriveApplications);
router.patch('/:id/status', authorize('company', 'admin', 'tpcell'), updateApplicationStatus);
router.patch('/:id/noc', authorize('admin', 'tpcell'), updateApplicationNoc);
router.delete('/:id', authorize('student'), withdrawApplication);

module.exports = router;
