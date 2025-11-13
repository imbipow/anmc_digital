const express = require('express');
const router = express.Router();
const multer = require('multer');
const s3Service = require('../services/s3Service');
const { verifyToken, requireManager, requireMember } = require('../middleware/auth');
const dynamoDBService = require('../services/dynamodb');
const config = require('../config');

// Configure multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow documents only (PDF, DOC, DOCX, XLS, XLSX, etc.)
        const allowedMimes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'image/jpeg',
            'image/png'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only document and image files are allowed'), false);
        }
    }
});

const DOCUMENTS_TABLE = config.tables.documents || 'anmc-documents-dev';

// Upload document
router.post('/upload', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { title, description, category, visibility } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        // Upload to S3
        const s3Result = await s3Service.uploadFile(req.file, 'documents');

        // Save document metadata to DynamoDB
        const document = {
            id: Date.now().toString(),
            title,
            description: description || '',
            category: category || 'general',
            visibility: visibility || 'members', // 'members' or 'admin'
            fileName: req.file.originalname,
            fileSize: req.file.size,
            fileType: req.file.mimetype,
            s3Key: s3Result.key,
            url: s3Result.url,
            uploadedBy: req.body.uploadedBy || 'admin',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await dynamoDBService.putItem(DOCUMENTS_TABLE, document);

        res.status(201).json({
            message: 'Document uploaded successfully',
            document
        });
    } catch (error) {
        next(error);
    }
});

// Get all documents
router.get('/', verifyToken, requireMember, async (req, res, next) => {
    try {
        const { category, visibility } = req.query;

        let documents = await dynamoDBService.getAllItems(DOCUMENTS_TABLE);

        // Filter by category
        if (category) {
            documents = documents.filter(doc => doc.category === category);
        }

        // Filter by visibility
        if (visibility) {
            documents = documents.filter(doc => doc.visibility === visibility);
        }

        // Sort by date descending
        documents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(documents);
    } catch (error) {
        next(error);
    }
});

// Get single document
router.get('/:id', verifyToken, requireMember, async (req, res, next) => {
    try {
        const { id } = req.params;
        const document = await dynamoDBService.getItem(DOCUMENTS_TABLE, { id });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        res.json(document);
    } catch (error) {
        next(error);
    }
});

// Update document metadata
router.put('/:id', verifyToken, requireManager, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, category, visibility } = req.body;

        const updates = {
            updatedAt: new Date().toISOString()
        };

        if (title) updates.title = title;
        if (description) updates.description = description;
        if (category) updates.category = category;
        if (visibility) updates.visibility = visibility;

        const updatedDocument = await dynamoDBService.updateItem(DOCUMENTS_TABLE, { id }, updates);

        res.json({
            message: 'Document updated successfully',
            document: updatedDocument
        });
    } catch (error) {
        next(error);
    }
});

// Delete document
router.delete('/:id', verifyToken, requireManager, async (req, res, next) => {
    try {
        const { id } = req.params;

        // Get document to find S3 key
        const document = await dynamoDBService.getItem(DOCUMENTS_TABLE, { id });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Delete from S3
        await s3Service.deleteFile(document.s3Key);

        // Delete from DynamoDB
        await dynamoDBService.deleteItem(DOCUMENTS_TABLE, { id });

        res.json({
            message: 'Document deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

// Get document download URL
router.get('/:id/download', verifyToken, requireMember, async (req, res, next) => {
    try {
        const { id } = req.params;

        const document = await dynamoDBService.getItem(DOCUMENTS_TABLE, { id });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // For public documents, return the public URL
        // For private documents, generate a signed URL
        const url = document.url;

        res.json({
            url,
            fileName: document.fileName,
            fileType: document.fileType
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
