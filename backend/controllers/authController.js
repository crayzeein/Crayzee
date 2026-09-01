const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- TOKEN GENERATION ---
const generateAccessToken = (id) => {
  return jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, { expiresIn: '2h' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Helper: generate both tokens and save refresh token to DB
const generateTokenPair = async (user) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Save hashed refresh token to user document
  user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

// Helper: build user response with both tokens
const buildAuthResponse = async (user) => {
  const { accessToken, refreshToken } = await generateTokenPair(user);
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    token: accessToken,
    refreshToken: refreshToken
  };
};

// Helper to strictly enforce strings and reject objects/arrays (NoSQL injection prevention)
const sanitizeString = (val) => {
  if (typeof val !== 'string') return '';
  return val.trim();
};

// --- REGISTER ---
exports.registerUser = async (req, res) => {
  const name = sanitizeString(req.body.name);
  const email = sanitizeString(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  try {
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and a valid email are required' });
    }

    if (password && password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const userExists = await User.findOne({ email });

    // Only block if user is already verified (actual existing user)
    if (userExists && userExists.isVerified) {
      return res.status(400).json({ message: 'User already exists. Please login.' });
    }

    let user;
    if (userExists && !userExists.isVerified) {
      // User exists but never verified — let them re-signup (resend OTP)
      userExists.name = name;
      if (password) userExists.password = password;
      user = userExists;
    } else {
      // Brand new user
      user = await User.create({ name, email, password, isVerified: false });
    }
    
    // Generate fresh OTP and reset attempt counter
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.signupOtp = otp;
    user.signupOtpExpires = Date.now() + 15 * 60 * 1000;
    user.signupOtpAttempts = 0;
    await user.save();

    // Send email in background (don't await — respond immediately)
    resend.emails.send({
      from: `Crayzee <${emailFrom}>`,
      to: email,
      subject: 'Your Crayzee Verification Code',
      html: `<p>Your verification code is: <strong>${otp}</strong></p><p>Please enter it to verify your account.</p>`,
    }).then(response => {
      if (response.error) {
        console.log('Email send failed:', response.error);
      } else {
        console.log('Email sent successfully:', response.data);
      }
    }).catch(emailErr => {
      console.log('Email send failed (network error):', emailErr.message);
    });

    res.status(201).json({ message: 'OTP sent to email. Please verify.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- VERIFY SIGNUP OTP ---
exports.verifySignupOTP = async (req, res) => {
  const email = sanitizeString(req.body.email).toLowerCase();
  const otp = sanitizeString(req.body.otp);

  if (!email || !otp) {
    return res.status(400).json({ message: 'Valid email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    // Enforce OTP attempt limit (max 5)
    if (user.signupOtpAttempts >= 5) {
      user.signupOtp = undefined;
      user.signupOtpExpires = undefined;
      user.signupOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (
      !user.signupOtp ||
      user.signupOtp !== otp ||
      !user.signupOtpExpires ||
      user.signupOtpExpires < Date.now()
    ) {
      user.signupOtpAttempts = (user.signupOtpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      const remaining = Math.max(0, 5 - user.signupOtpAttempts);
      return res.status(400).json({
        message: remaining > 0 
          ? `Invalid or expired OTP. ${remaining} attempt(s) remaining.` 
          : 'Too many failed attempts. Please request a new OTP.'
      });
    }

    user.isVerified = true;
    user.signupOtp = undefined;
    user.signupOtpExpires = undefined;
    user.signupOtpAttempts = 0;
    await user.save();

    const response = await buildAuthResponse(user);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- LOGIN ---
exports.loginUser = async (req, res) => {
  const email = sanitizeString(req.body.email).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (user && user.password && (await user.comparePassword(password))) {

      if (user.isVerified === false) {
        return res.status(403).json({ message: 'Please verify your email address to log in' });
      }

      const response = await buildAuthResponse(user);
      res.json(response);
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- FORGOT PASSWORD FLOW ---

const resend = new Resend(process.env.RESEND_API_KEY);
const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

exports.forgotPassword = async (req, res) => {
  const email = sanitizeString(req.body.email).toLowerCase();
  try {
    if (!email) {
      return res.status(400).json({ message: 'Valid email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    user.resetOtpAttempts = 0; // Reset attempts on fresh OTP request
    await user.save();

    // Send email in background (don't await — respond immediately)
    resend.emails.send({
      from: `Crayzee <${emailFrom}>`,
      to: email,
      subject: 'Your Crayzee Password Reset OTP',
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>It covers the next 15 minutes.</p>`,
    }).then(response => {
      if (response.error) {
        console.log('Email send failed:', response.error);
      } else {
        console.log('Email sent successfully:', response.data);
      }
    }).catch(emailErr => {
      console.log('Email send failed (network error):', emailErr.message);
    });

    res.json({ message: 'OTP sent to your email successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const email = sanitizeString(req.body.email).toLowerCase();
  const otp = sanitizeString(req.body.otp);

  if (!email || !otp) {
    return res.status(400).json({ message: 'Valid email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    // Enforce OTP attempt limit (max 5)
    if (user.resetOtpAttempts >= 5) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpires = undefined;
      user.resetOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (
      !user.resetPasswordOtp ||
      user.resetPasswordOtp !== otp ||
      !user.resetPasswordOtpExpires ||
      user.resetPasswordOtpExpires < Date.now()
    ) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      const remaining = Math.max(0, 5 - user.resetOtpAttempts);
      return res.status(400).json({
        message: remaining > 0 
          ? `Invalid or expired OTP. ${remaining} attempt(s) remaining.` 
          : 'Too many failed attempts. Please request a new OTP.'
      });
    }

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const email = sanitizeString(req.body.email).toLowerCase();
  const otp = sanitizeString(req.body.otp);
  const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP and new password are required' });
  }

  try {
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: 'Invalid or expired session' });

    // Enforce OTP attempt limit (max 5)
    if (user.resetOtpAttempts >= 5) {
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpires = undefined;
      user.resetOtpAttempts = 0;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    if (
      !user.resetPasswordOtp ||
      user.resetPasswordOtp !== otp ||
      !user.resetPasswordOtpExpires ||
      user.resetPasswordOtpExpires < Date.now()
    ) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Password reset successful
    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    user.resetOtpAttempts = 0;
    user.refreshToken = undefined; // Invalidate all prior sessions immediately
    await user.save();

    res.json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- GOOGLE AUTH ---
exports.googleAuth = async (req, res) => {
  const { credential } = req.body;
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${credential}` }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
    }

    const payload = await response.json();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user for google auth - directly verified
      user = await User.create({
        name,
        email,
        // No password for Google accounts — they authenticate via Google only
        isVerified: true
      });
    } else if (user.isVerified === false) {
      // If an existing unverified user simply logs in with Google, we verify them!
      user.isVerified = true;
      await user.save();
    }

    const authResponse = await buildAuthResponse(user);
    res.json(authResponse);

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google Authentication failed' });
  }
};

// --- REFRESH TOKEN ---
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    // Find user and check stored refresh token matches
    const hashedToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const user = await User.findOne({ _id: decoded.id, refreshToken: hashedToken });

    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'User is blocked' });
    }

    // Generate new token pair
    const authResponse = await buildAuthResponse(user);
    res.json(authResponse);

  } catch (error) {
    // Token expired or invalid
    return res.status(401).json({ message: 'Refresh token expired, please login again' });
  }
};

// --- LOGOUT (Invalidate refresh token) ---
exports.logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- PROFILE ---
exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      shippingAddress: user.shippingAddress
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.shippingAddress) {
        user.shippingAddress = {
          address: req.body.shippingAddress.address || user.shippingAddress?.address,
          city: req.body.shippingAddress.city || user.shippingAddress?.city,
          postalCode: req.body.shippingAddress.postalCode || user.shippingAddress?.postalCode,
          country: req.body.shippingAddress.country || user.shippingAddress?.country,
        };
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      const { accessToken, refreshToken } = await generateTokenPair(updatedUser);

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
        shippingAddress: updatedUser.shippingAddress,
        token: accessToken,
        refreshToken: refreshToken,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
