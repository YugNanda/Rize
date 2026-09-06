const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const {
  getDrives, getDriveById, getDriveCounts, createDrive, updateDrive,
  updateDriveStatus, deleteDrive,
} = require('../controllers/drive.controller');

const router = express.Router();

router.use(protect);

router.get('/counts', getDriveCounts);
router.get('/', getDrives);
router.get('/:id', getDriveById);
router.post('/', authorize('company', 'admin', 'tpcell'), createDrive);
router.put('/:id', authorize('company', 'admin', 'tpcell'), updateDrive);
router.patch('/:id/status', authorize('company', 'admin', 'tpcell'), updateDriveStatus);
router.delete('/:id', authorize('company', 'admin', 'tpcell'), deleteDrive);

module.exports = router;

