const express = require('express');
const router = express.Router();
const { cloudinary, upload } = require('../utils/cloudinary');
const { protect, admin } = require('../middleware/auth');

// @desc    Upload images to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, admin, upload.array('images', 5), async (req, res) => {
    try {
        console.log('Upload request received. Files count:', req.files ? req.files.length : 0);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'crayzee_products' },
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload_stream error:', JSON.stringify(error, null, 2));
                            return reject(error);
                        }
                        if (!result) {
                            return reject(new Error('Cloudinary returned no result'));
                        }
                        resolve({
                            url: result.secure_url,
                            public_id: result.public_id
                        });
                    }
                );
                stream.end(file.buffer);
            });
        });

        const results = await Promise.all(uploadPromises);
        console.log('Upload successful:', results);
        res.json(results);
    } catch (error) {
        console.error('Final Upload Catch:', error);
        const errorMessage = error.message || (typeof error === 'string' ? error : JSON.stringify(error));
        res.status(500).json({ message: 'Server Upload Error: ' + errorMessage });
    }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:public_id
// @access  Private/Admin
router.delete('/:public_id', protect, admin, async (req, res) => {
    try {
        const { cloudinary } = require('../utils/cloudinary');
        await cloudinary.uploader.destroy(req.params.public_id);
        res.json({ message: 'Image deleted from Cloudinary' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
