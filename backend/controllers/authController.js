const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// --- TOKEN GENERATION ---
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
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

// --- REGISTER ---
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
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
    
    // Generate fresh OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.signupOtp = otp;
    user.signupOtpExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    console.log(`[SIGNUP OTP GENERATED] ${otp} for ${email}`);

    // Send email in background (don't await — respond immediately)
    transporter.sendMail({
      from: `"Crayzee" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Crayzee Verification Code',
      html: `<p>Your verification code is: <strong>${otp}</strong></p><p>Please enter it to verify your account.</p>`,
    }).catch(emailErr => {
      console.log('Email send failed:', emailErr.message);
    });

    res.status(201).json({ message: 'OTP sent to email. Please verify.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- VERIFY SIGNUP OTP ---
exports.verifySignupOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ 
      email, 
      signupOtp: otp,
      signupOtpExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    user.isVerified = true;
    user.signupOtp = undefined;
    user.signupOtpExpires = undefined;
    await user.save();

    const response = await buildAuthResponse(user);
    res.json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- LOGIN ---
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      
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

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'testpass',
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOtp = otp;
    user.resetPasswordOtpExpires = Date.now() + 15 * 60 * 1000; // 15 mins
    await user.save();

    console.log(`[OTP GENERATED] ${otp} for ${email}`);

    // Send email in background (don't await — respond immediately)
    transporter.sendMail({
      from: `"Crayzee" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Crayzee Password Reset OTP',
      html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>It covers the next 15 minutes.</p>`,
    }).catch(emailErr => {
      console.log('Email send failed:', emailErr.message);
    });

    res.json({ message: 'OTP sent to your email successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordOtpExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    if (newPassword && newPassword.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordOtpExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired session' });

    user.password = newPassword;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
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
        password: '', // Optional password
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
