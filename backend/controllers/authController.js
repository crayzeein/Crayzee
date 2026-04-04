const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (password && password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, isVerified: false });
    
    if (user) {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.signupOtp = otp;
      user.signupOtpExpires = Date.now() + 15 * 60 * 1000;
      await user.save();

      console.log(`[SIGNUP OTP GENERATED] ${otp} for ${email}`);

      try {
        await transporter.sendMail({
          from: '"Crayzee" <noreply@crayzee.in>',
          to: email,
          subject: 'Your Crayzee Verification Code',
          html: `<p>Your verification code is: <strong>${otp}</strong></p><p>Please enter it to verify your account.</p>`,
        });
      } catch(emailErr) {
        console.log('Nodemailer error (safe to ignore in dev if testing with console log):', emailErr);
      }

      res.status(201).json({ message: 'OTP sent to email. Please verify.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      
      if (user.isVerified === false) {
        return res.status(403).json({ message: 'Please verify your email address to log in' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- FORGOT PASSWORD FLOW ---

const transporter = nodemailer.createTransport({
  service: 'gmail', // Standard gmail setup, can be adjusted
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'testpass',
  },
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

    // Try sending email, catch error but don't crash standard flow during development
    try {
      await transporter.sendMail({
        from: '"Crayzee" <noreply@crayzee.in>',
        to: email,
        subject: 'Your Crayzee Password Reset OTP',
        html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>It covers the next 15 minutes.</p>`,
      });
    } catch(emailErr) {
      console.log('Nodemailer error (safe to ignore in dev if testing with console log):', emailErr);
    }

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

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(401).json({ message: 'Google Authentication failed' });
  }
};

exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
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

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        shippingAddress: updatedUser.shippingAddress,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
