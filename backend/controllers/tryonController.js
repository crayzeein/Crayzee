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

// Helper: pull a usable image URL out of a Gradio output value, whatever
// shape it comes in (raw string, {url}, {path}, or a gallery item wrapping
// one of those in an "image" key).
const extractImageUrl = (outputItem, spaceOrigin) => {
  if (!outputItem) return null;
  const item = outputItem.image || outputItem;
  if (typeof item === 'string') return item;
  if (item.url) return item.url;
  if (item.path) return `${spaceOrigin}/file=${item.path}`;
  return null;
};

// Free HF account token (optional). Logged-in requests get a larger
// ZeroGPU quota than fully anonymous ones on these public Spaces.
const HF_TOKEN = process.env.HF_TOKEN || undefined;
console.log('HF_TOKEN loaded from env:', HF_TOKEN ? `yes (starts with ${HF_TOKEN.slice(0, 6)}...)` : 'NO - not set');

// Free public virtual try-on Spaces, tried in order. Each Space has its own
// independent HuggingFace GPU quota, so when one is exhausted/busy we fall
// through to the next instead of failing the whole request.
const TRYON_PROVIDERS = [
  {
    name: 'IDM-VTON',
    call: async (Client, handle_file, garmentImageUrl, humanImageUrl, garmentDescription) => {
      const client = await Client.connect('yisol/IDM-VTON', { hf_token: HF_TOKEN });
      const result = await client.predict('/tryon', {
        dict: {
          background: handle_file(humanImageUrl),
          layers: [],
          composite: null
        },
        garm_img: handle_file(garmentImageUrl),
        garment_des: garmentDescription || 'clothing item',
        is_checked: true,
        is_checked_crop: true,
        denoise_steps: 35,
        seed: 42
      });
      return extractImageUrl(result?.data?.[0], 'https://yisol-idm-vton.hf.space');
    }
  },
  {
    name: 'OOTDiffusion',
    call: async (Client, handle_file, garmentImageUrl, humanImageUrl) => {
      const client = await Client.connect('levihsu/OOTDiffusion', { hf_token: HF_TOKEN });
      const result = await client.predict('/process_hd', [
        handle_file(humanImageUrl),  // Model
        handle_file(garmentImageUrl), // Garment
        1,    // Images
        30,   // Steps
        2.0,  // Guidance scale
        -1    // Seed (random)
      ]);
      const gallery = result?.data?.[0];
      const first = Array.isArray(gallery) ? gallery[0] : gallery;
      return extractImageUrl(first, 'https://levihsu-ootdiffusion.hf.space');
    }
  },
  {
    name: 'Kolors-Virtual-Try-On',
    call: async (Client, handle_file, garmentImageUrl, humanImageUrl) => {
      const client = await Client.connect('Kwai-Kolors/Kolors-Virtual-Try-On', { hf_token: HF_TOKEN });
      const result = await client.predict(2, [
        handle_file(humanImageUrl),   // Person image
        handle_file(garmentImageUrl), // Garment image
        0,     // Seed
        true   // Randomize seed
      ]);
      return extractImageUrl(result?.data?.[0], 'https://kwai-kolors-kolors-virtual-try-on.hf.space');
    }
  }
];

// Helper: try each free provider in order until one succeeds
const generateWithFallback = async (garmentImageUrl, humanImageUrl, garmentDescription) => {
  const { Client, handle_file } = await import('@gradio/client');

  let lastError;
  for (const provider of TRYON_PROVIDERS) {
    try {
      console.log(`Trying AI try-on provider: ${provider.name}...`);
      const resultImageUrl = await provider.call(Client, handle_file, garmentImageUrl, humanImageUrl, garmentDescription);
      if (resultImageUrl) {
        console.log(`Provider ${provider.name} succeeded`);
        return { resultImageUrl, providerUsed: provider.name };
      }
      throw new Error(`No result image received from ${provider.name}`);
    } catch (err) {
      console.error(`Provider ${provider.name} failed:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All AI try-on providers failed');
};

// Helper: Download the HuggingFace result immediately and inline it as base64.
// HuggingFace's temp file URLs get evicted/expire within moments, so the
// browser fetching them later (from a different machine/session) fails with
// "File not found". Downloading right away, while the file is still fresh,
// and embedding the bytes directly avoids that race condition entirely.
const inlineResultImage = async (resultImageUrl) => {
  const response = await fetch(resultImageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download AI result image (status ${response.status})`);
  }
  const contentType = response.headers.get('content-type') || 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString('base64')}`;
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

    // 5. Call free AI try-on providers, falling back through the list if
    // one is out of quota/busy
    const { resultImageUrl, providerUsed } = await generateWithFallback(
      garmentImageUrl,
      userPhotoResult.url,
      `${product.name} - ${product.subCategory || 'clothing'}`
    );
    console.log(`Try-on result (via ${providerUsed}):`, resultImageUrl);

    // 6. Download the result now, while it's still fresh, and inline it
    // so the browser never has to fetch the ephemeral HuggingFace URL itself.
    const inlinedResultImage = await inlineResultImage(resultImageUrl);

    // 7. Clean up temp user photo from Cloudinary (async, don't wait)
    cloudinary.uploader.destroy(userPhotoResult.public_id).catch(err => {
      console.error('Failed to cleanup temp photo:', err.message);
    });

    res.json({
      success: true,
      resultImage: inlinedResultImage,
      resultimage: inlinedResultImage,
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
      message = 'All AI servers are busy right now. Please try again in a few minutes.';
    }

    res.status(500).json({
      message: message,
      success: false
    });
  }
};

module.exports = { generateTryOn };
