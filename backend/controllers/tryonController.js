const Product = require('../models/Product');
const { cloudinary } = require('../utils/cloudinary');

// In-memory rate limit store (resets on server restart)
const tryonLimits = new Map();
const MAX_TRYON_PER_DAY = 3;

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of tryonLimits.entries()) {
    if (now - data.firstRequest > 24 * 60 * 60 * 1000) {
      tryonLimits.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Helper: Check rate limit by IP
const checkRateLimit = (ip) => {
  const now = Date.now();
  const userData = tryonLimits.get(ip);

  if (!userData || now - userData.firstRequest > 24 * 60 * 60 * 1000) {
    tryonLimits.set(ip, { count: 1, firstRequest: now });
    return { allowed: true, remaining: MAX_TRYON_PER_DAY - 1 };
  }

  if (userData.count >= MAX_TRYON_PER_DAY) {
    return { allowed: false, remaining: 0 };
  }

  userData.count += 1;
  return { allowed: true, remaining: MAX_TRYON_PER_DAY - userData.count };
};

// Helper: Upload buffer to Cloudinary and return URL
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'crayzee_tryon_temp',
        resource_type: 'image',
        transformation: [
          { width: 768, height: 1024, crop: 'limit' },
          { quality: 'auto', fetch_format: 'jpg' }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary returned no result'));
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

// Helper: Call HuggingFace IDM-VTON Space (FREE)
const callHuggingFace = async (garmentImageUrl, humanImageUrl, garmentDescription) => {
  // Dynamic import for ES module
  const { Client, handle_file } = await import('@gradio/client');

  console.log('Connecting to HuggingFace IDM-VTON Space...');
  const client = await Client.connect("yisol/IDM-VTON");

  console.log('Calling /tryon API...');
  const result = await client.predict("/tryon", {
    dict: {
      "background": handle_file(humanImageUrl),
      "layers": [],
      "composite": null
    },
    garm_img: handle_file(garmentImageUrl),
    garment_des: garmentDescription || "clothing item",
    is_checked: true,        // Use auto-masking
    is_checked_crop: true,   // Auto-crop
    denoise_steps: 20,       // Fewer steps = faster
    seed: 0                  // Random seed
  });

  console.log('HuggingFace result received');

  // Result contains [output_image, masked_image]
  // We want the first one (the try-on result)
  if (result && result.data && result.data[0]) {
    const outputData = result.data[0];
    // The result can be a URL or a file object with url property
    if (typeof outputData === 'string') {
      return outputData;
    } else if (outputData.url) {
      return outputData.url;
    } else if (outputData.path) {
      // Build the URL from the Space
      return `https://yisol-idm-vton.hf.space/file=${outputData.path}`;
    }
  }

  throw new Error('No result image received from AI model');
};

// @desc    Generate AI Virtual Try-On
// @route   POST /api/tryon/generate
// @access  Public (rate limited)
const generateTryOn = async (req, res) => {
  try {
    // 1. Rate limit check
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const rateCheck = checkRateLimit(clientIp);

    if (!rateCheck.allowed) {
      return res.status(429).json({
        message: 'Daily limit reached! You can try 3 times per day. Come back tomorrow! 🙏',
        remaining: 0
      });
    }

    // 2. Validate inputs
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload your photo' });
    }

    // 3. Fetch product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get first product image URL
    const garmentImageUrl = product.images?.[0]?.url;
    if (!garmentImageUrl) {
      return res.status(400).json({ message: 'Product has no image for try-on' });
    }

    // 4. Upload user photo to Cloudinary (temporary)
    console.log('Uploading user photo to Cloudinary...');
    const userPhotoResult = await uploadToCloudinary(req.file.buffer);
    console.log('User photo uploaded:', userPhotoResult.url);

    // 5. Call HuggingFace Free API
    console.log('Calling HuggingFace IDM-VTON (free)...');
    const resultImageUrl = await callHuggingFace(
      garmentImageUrl,
      userPhotoResult.url,
      `${product.name} - ${product.subCategory || 'clothing'}`
    );
    console.log('Try-on result:', resultImageUrl);

    // 6. Clean up temp user photo from Cloudinary (async, don't wait)
    cloudinary.uploader.destroy(userPhotoResult.public_id).catch(err => {
      console.error('Failed to cleanup temp photo:', err.message);
    });

    res.json({
      success: true,
      resultImage: resultImageUrl,
      resultimage: resultImageUrl,
      remaining: rateCheck.remaining,
      message: `Try-on generated! You have ${rateCheck.remaining} tries remaining today.`
    });

  } catch (error) {
    console.error('Try-on error:', error);

    // Friendly error messages
    let message = 'Failed to generate try-on. Please try again.';
    if (error.message?.includes('queue') || error.message?.includes('busy')) {
      message = 'AI server is busy right now. Please try again in a few minutes.';
    } else if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
      message = 'Request timed out. The AI server is slow right now. Please try again.';
    } else if (error.message?.includes('GPU') || error.message?.includes('quota')) {
      message = 'AI server GPU quota exceeded. Please try again in a few minutes.';
    }

    res.status(500).json({
      message: message,
      success: false
    });
  }
};

module.exports = { generateTryOn };
