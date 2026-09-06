const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Student = require('../models/Student.model');
const Company = require('../models/Company.model');
const { sendSuccess, sendError } = require('../utils/response');

const STUDENT_AVATARS = [
  '/avatars/avatar-1.png',
  '/avatars/avatar-2.jpg',
  '/avatars/avatar-3.jpg',
  '/avatars/avatar-4.jpg',
  '/avatars/avatar-5.jpg',
  '/avatars/avatar-6.jpg',
  '/avatars/avatar-7.jpg',
  '/avatars/avatar-8.jpg',
];

const getUniqueStudentAvatar = (name = '', email = '') => {
  if (email && email.toLowerCase().includes('yug')) {
    return '/avatars/yug.png';
  }
  const key = `${email || ''}_${name || ''}_${Date.now()}`.toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % STUDENT_AVATARS.length;
  return STUDENT_AVATARS[index];
};

const getCompanyLogoForName = (name = '') => {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const known = [
    'google', 'microsoft', 'razorpay', 'zerodha', 'cred',
    'phonepe', 'groww', 'flipkart', 'atlassian', 'browserstack',
    'meesho', 'amazon', 'fundingpips', 'legionfunding', 'fundedfirm'
  ];
  for (const k of known) {
    if (clean.includes(k) || k.includes(clean)) {
      return `/logos/${k}.svg`;
    }
  }
  return `/logos/${clean || 'company'}.svg`;
};

// Enrich user with avatar and role-specific profile details
const enrichUserData = async (userDoc) => {
  const userObj = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
  delete userObj.password;

  if (userObj.role === 'company') {
    const company = await Company.findOne({ createdBy: userObj._id }) || await Company.findOne({ email: userObj.email });
    if (company && company.logoUrl) {
      userObj.avatar = company.logoUrl;
      userObj.logoUrl = company.logoUrl;
    } else if (!userObj.avatar) {
      userObj.avatar = getCompanyLogoForName(userObj.name);
      userObj.logoUrl = userObj.avatar;
    } else {
      userObj.logoUrl = userObj.avatar;
    }
  } else if (userObj.role === 'student') {
    const student = await Student.findOne({ userId: userObj._id });
    if (student && student.profilePhotoUrl) {
      userObj.avatar = student.profilePhotoUrl;
      userObj.profilePhotoUrl = student.profilePhotoUrl;
    } else if (!userObj.avatar) {
      const defaultAvatar = getUniqueStudentAvatar(userObj.name, userObj.email);
      userObj.avatar = defaultAvatar;
      userObj.profilePhotoUrl = defaultAvatar;
      await User.findByIdAndUpdate(userObj._id, { avatar: defaultAvatar });
      if (student) {
        await Student.findByIdAndUpdate(student._id, { profilePhotoUrl: defaultAvatar });
      }
    } else {
      userObj.profilePhotoUrl = userObj.avatar;
    }
  }

  return userObj;
};

// Helper: sign JWT and set HTTP-only cookie
const signTokenAndRespond = async (res, user, statusCode, message) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie('token', token, cookieOptions);

  const enrichedUser = await enrichUserData(user);

  return sendSuccess(res, statusCode, message, { user: enrichedUser, token });
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check duplicate email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'An account with this email already exists.');
    }

    // Prevent self-registration as admin
    const assignedRole = role === 'admin' ? 'student' : role || 'student';

    let defaultAvatar = '';
    if (assignedRole === 'student') {
      defaultAvatar = getUniqueStudentAvatar(name, email);
    } else if (assignedRole === 'company') {
      defaultAvatar = getCompanyLogoForName(name);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      avatar: defaultAvatar,
    });

    // If student role, create student profile with unique default avatar
    if (assignedRole === 'student') {
      await Student.create({
        userId: user._id,
        profilePhotoUrl: defaultAvatar,
      });
    } else if (assignedRole === 'company') {
      await Company.create({
        name: user.name,
        email: user.email,
        createdBy: user._id,
        isVerified: true,
        logoUrl: defaultAvatar,
      });
    }

    return await signTokenAndRespond(res, user, 201, 'Account created successfully.');
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user with password (select: false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated. Contact support.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    return await signTokenAndRespond(res, user, 200, 'Logged in successfully.');
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'lax',
  });
  return sendSuccess(res, 200, 'Logged out successfully.');
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return sendError(res, 404, 'User not found.');
    const enriched = await enrichUserData(user);
    return sendSuccess(res, 200, 'User fetched successfully.', { user: enriched });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 400, 'Current password is incorrect.');
    }

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, 'Password changed successfully.');
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 400, 'Please provide an email address.');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return sendError(res, 404, 'No account found with this email address.');
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, 200, 'Password reset verification code generated.', {
      code,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return sendError(res, 400, 'Please provide email, verification code, and new password.');
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters long.');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password +resetPasswordCode +resetPasswordExpires');

    if (!user) {
      return sendError(res, 404, 'User not found.');
    }

    if (!user.resetPasswordCode || user.resetPasswordCode.trim() !== code.toString().trim()) {
      return sendError(res, 400, 'Invalid verification code. Please check and try again.');
    }

    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return sendError(res, 400, 'Verification code has expired. Please request a new one.');
    }

    // Update password and clear reset code fields
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return sendSuccess(res, 200, 'Password has been reset successfully. You can now log in.');
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, getMe, changePassword, forgotPassword, resetPassword };
