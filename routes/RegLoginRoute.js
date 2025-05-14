const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/userSchema'); 
const UserDetails = require('../models/userDetailsSchema');
const Token = require('../models/tokenSchema');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const router = express.Router();

// Register Route
// router.post('/register', [
//   body('name').trim()
//     .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long')
//     .matches(/^[a-zA-Z ]+$/).withMessage('Name should contain only alphabets and spaces'),

//   body('username').trim()
//     .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
//     .custom(async (value) => {
//       const existingUser = await User.findOne({ username: value });
//       if (existingUser) {
//         throw new Error('Username already taken');
//       }
//       return true;
//     }),

//   body('email')
//     .isEmail().withMessage('Please enter a valid email')
//     .normalizeEmail()
//     .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/).withMessage('Email must end with .com or .in')
//     .custom(async (value) => {
//       const existingEmail = await User.findOne({ email: value });
//       if (existingEmail) {
//         throw new Error('Email already registered');
//       }
//       return true;
//     }),

//   body('password')
//     .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
//     .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{8,}$/)
//     .withMessage('Password must contain uppercase, lowercase, number, and special character'),

//   body('passwordConfirmation').custom((value, { req }) => {
//     if (value !== req.body.password) {
//       throw new Error('Passwords do not match');
//     }
//     return true;
//   }),

//   body('phone')
//     .matches(/^[6-9][0-9]{9}$/).withMessage('Phone number must start with 6, 7, 8, or 9 and be 10 digits'),

//   body('gender')
//     .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),

//   body('dob').custom((value) => {
//     const dob = new Date(value);
//     const now = new Date();
//     const age = now.getFullYear() - dob.getFullYear();
//     if (dob > now) {
//       throw new Error('Date of birth cannot be in the future');
//     }
//     if (age < 13) {
//       throw new Error('You must be at least 13 years old to register');
//     }
//     if (age > 100) {
//       throw new Error('Age cannot be more than 100 years');
//     }
//     return true;
//   }),

//   body('securityQuestion').optional().isLength({ min: 10 }).withMessage('Security question must be at least 10 characters'),
//   body('securityQuestionAnswer').optional().isLength({ min: 2 }).withMessage('Security question answer must be at least 2 characters'),


// ], async (req, res) => {
//   // Handle Validation Errors
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const {
//       name, username, email, password, phone, gender,
//       dob, securityQuestion, securityQuestionAnswer, adminSecret
//     } = req.body;

//     // Check if ADMIN_SECRET is provided
//     const isAdmin = adminSecret === process.env.ADMIN_SECRET;

//     let role = 'User';  // Default role
//     let userDetailsData = {
//       phone,
//       gender,
//       dob,
//       lastLogin: null, // Initially null
//       loginHistory: [],
//       securityQuestion: securityQuestion || '',
//       securityQuestionAnswer: securityQuestionAnswer || ''
//     };

//     if (isAdmin) {
//       // Admin registration does not need security question and answer
//       role = 'admin';
//       userDetailsData.securityQuestion = ''; // Empty security question for admin
//       userDetailsData.securityQuestionAnswer = ''; // Empty security answer for admin
//     }

//     // Hash Password
//     const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);


//     // Create User
//     const newUser = new User({
//       name,
//       username,
//       email,
//       password: hashedPassword,
//       role,
//     });

//     await newUser.save();

//     // Create UserDetails
//     const newUserDetails = new UserDetails({
//       userId: newUser._id,
//       ...userDetailsData
//     });

//     await newUserDetails.save();

//     // Link UserDetails to User
//     newUser.userdetailsid = newUserDetails._id;
//     await newUser.save();

//     // Send Response
//     res.status(201).json({
//       message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!`,
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         username: newUser.username,
//         email: newUser.email,
//         role: newUser.role,
//         status: newUser.status,
//         userdetailsid: newUser.userdetailsid
//       }
//     });

//   } catch (error) {
//     console.error('Registration Error:', error.message);
//     res.status(500).json({ message: 'Server Error' });
//   }
// });
router.post('/register', [
  body('name').trim()
    .isLength({ min: 3 }).withMessage('Name must be at least 3 characters long')
    .matches(/^[a-zA-Z ]+$/).withMessage('Name should contain only alphabets and spaces'),

  body('username').trim()
    .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters')
    .custom(async (value) => {
      const existingUser = await User.findOne({ username: value });
      if (existingUser) {
        throw new Error('Username already taken');
      }
      return true;
    }),

  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/).withMessage('Email must end with .com or .in')
    .custom(async (value) => {
      const existingEmail = await User.findOne({ email: value });
      if (existingEmail) {
        throw new Error('Email already registered');
      }
      return true;
    }),

  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{8,}$/)
    .withMessage('Password must contain uppercase, lowercase, number, and special character'),

  body('passwordConfirmation').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),

  body('phone')
    .matches(/^[6-9][0-9]{9}$/).withMessage('Phone number must start with 6, 7, 8, or 9 and be 10 digits'),

  body('gender')
    .isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),

  body('dob').custom((value, { req }) => {
    const isAdmin = req.body.adminSecret === process.env.ADMIN_SECRET;

    // For normal users, dob is required
    if (!value && !isAdmin) {
      throw new Error('Date of birth is required');
    }

    // If admin provided dob, validate it
    if (value && !isAdmin) {
      const dob = new Date(value);
      const now = new Date();
      const age = now.getFullYear() - dob.getFullYear();

      if (dob > now) {
        throw new Error('Date of birth cannot be in the future');
      }
      if (age < 13) {
        throw new Error('You must be at least 13 years old to register');
      }
      if (age > 100) {
        throw new Error('Age cannot be more than 100 years');
      }
    }

    return true;
  }),

  body('securityQuestion').optional().isLength({ min: 10 }).withMessage('Security question must be at least 10 characters'),
  body('securityQuestionAnswer').optional().isLength({ min: 2 }).withMessage('Security question answer must be at least 2 characters'),

], async (req, res) => {
  // Handle Validation Errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name, username, email, password, phone, gender,
      dob, securityQuestion, securityQuestionAnswer, adminSecret
    } = req.body;

    const isAdmin = adminSecret === process.env.ADMIN_SECRET;

    // ❌ Block attempts to register as admin with wrong or missing secret
    if (adminSecret && !isAdmin) {
      return res.status(403).json({ message: 'Invalid admin secret key' });
    }

    // ✅ Prevent sneaky admin role assignment
    if (!adminSecret && req.body.role === 'admin') {
      return res.status(403).json({ message: 'Admin registration requires a valid secret key' });
    }

    let role = 'User';  // Default role
    let userDetailsData = {
      phone,
      gender,
      dob: isAdmin ? null : dob, // If admin skips dob, allow null
      lastLogin: null, // Initially null
      loginHistory: [],
      securityQuestion: securityQuestion || '',
      securityQuestionAnswer: securityQuestionAnswer || ''
    };

    if (isAdmin) {
      role = 'admin';
      userDetailsData.securityQuestion = '';
      userDetailsData.securityQuestionAnswer = '';
    }

    // Hash Password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create User
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    // Create UserDetails
    const newUserDetails = new UserDetails({
      userId: newUser._id,
      ...userDetailsData
    });

    await newUserDetails.save();

    // Link UserDetails to User
    newUser.userdetailsid = newUserDetails._id;
    await newUser.save();

    // Send Response
    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!`,
      user: {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        userdetailsid: newUser.userdetailsid
      }
    });

  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
});



// Login Route


router.post('/login', [
  body('email')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail()
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|in)$/)
    .withMessage('Email must end with .com or .in'),

  body('password')
    .notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ✅ Your requested block starts here

    // Update login history and lastLogin in UserDetails
    const userDetails = await UserDetails.findOne({ userId: user._id });
    if (userDetails) {
      userDetails.lastLogin = new Date();
      userDetails.loginHistory.push({ loginAt: new Date() });
      await userDetails.save();
    }

    // Generate JWT Token with 1 hour validity + 10 minutes grace time
    const expiresIn = 60 * 60; // 1 hour
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: expiresIn + 600 } // Extra 10 minutes grace time
    );

    // Save token in the Token model with expiry
    await Token.create({
      userid: user._id,
      token,
      expiry_at: new Date(Date.now() + (expiresIn + 600) * 1000)
    });

    // Return success response along with the generated token
    res.status(200).json({
      message: 'Login successful!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: userDetails?.lastLogin,
      },
      token: token
    });

    // ✅ Your requested block ends here

  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});


//secret question
router.post('/forgot-password/question', [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If the email exists, the question is sent' });

    const userDetails = await UserDetails.findOne({ userId: user._id });
    if (!userDetails || !userDetails.securityQuestion)
      return res.status(200).json({ message: 'If the email exists, the question is sent' });

    return res.status(200).json({ securityQuestion: userDetails.securityQuestion });

  } catch (err) {
    console.error('Question fetch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

//forgot password

router.post('/forgot-password', [
  body('email')
    .isEmail().withMessage('Enter a valid email')
    .normalizeEmail(),
  body('securityQuestionAnswer')
    .notEmpty().withMessage('Security answer is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{8,}$/)
    .withMessage('New password must contain uppercase, lowercase, number, and special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, securityQuestionAnswer, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userDetails = await UserDetails.findOne({ userId: user._id });
    if (!userDetails) return res.status(404).json({ message: 'User details not found' });

    if (
      !userDetails.securityQuestionAnswer ||
      userDetails.securityQuestionAnswer.trim().toLowerCase() !== securityQuestionAnswer.trim().toLowerCase()
    ) {
      return res.status(403).json({ message: 'Security answer is incorrect' });
    }

    // Hash and update password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: '✅ Password updated successfully' });

  } catch (err) {
    console.error('Forgot Password Error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
