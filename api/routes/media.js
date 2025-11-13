const express = require('express');
const router = express.Router();
const multer = require('multer');
const s3Service = require('../services/s3Service');

// Configure multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Upload single image
router.post('/upload', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const folder = req.body.folder || 'images';
        const result = await s3Service.uploadFile(req.file, folder);

        res.status(201).json({
            message: 'File uploaded successfully',
            file: result
        });
    } catch (error) {
        next(error);
    }
});

// Upload multiple images
router.post('/upload-multiple', upload.array('files', 10), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const folder = req.body.folder || 'images';
        const results = await s3Service.uploadMultipleFiles(req.files, folder);

        res.status(201).json({
            message: 'Files uploaded successfully',
            files: results
        });
    } catch (error) {
        next(error);
    }
});

// List images
router.get('/', async (req, res, next) => {
    try {
        const folder = req.query.folder || 'images';
        const files = await s3Service.listFiles(folder);

        res.json(files);
    } catch (error) {
        next(error);
    }
});

// Get file metadata
router.get('/metadata/:key(*)', async (req, res, next) => {
    try {
        const key = req.params.key;
        const metadata = await s3Service.getFileMetadata(key);

        res.json(metadata);
    } catch (error) {
        next(error);
    }
});

// Delete image
router.delete('/:key(*)', async (req, res, next) => {
    try {
        const key = req.params.key;
        const result = await s3Service.deleteFile(key);

        res.json({
            message: 'File deleted successfully',
            ...result
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
