const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { uploadLogo: multerLogo } = require('../middleware/upload.middleware');
const {
  getMyProfile, updateProfile, uploadLogo,
  getAllCompanies, getCompanyById, verifyCompany,
} = require('../controllers/company.controller');

const router = express.Router();

router.use(protect);

// Company's own profile
router.get('/profile', authorize('company'), getMyProfile);
router.put('/profile', authorize('company'), updateProfile);
router.post('/logo', authorize('company'), multerLogo.single('logo'), uploadLogo);

// Admin
router.get('/', authorize('admin'), getAllCompanies);
router.patch('/:id/verify', authorize('admin'), verifyCompany);

// Public (any authenticated user)
router.get('/:id', getCompanyById);

module.exports = router;
