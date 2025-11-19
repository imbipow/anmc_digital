const express = require('express');
const router = express.Router();
const dynamoDBService = require('../services/dynamodb');
const emailService = require('../services/emailService');
const { verifyToken, requireManager, requireAdmin } = require('../middleware/auth');
const config = require('../config');

const MESSAGES_TABLE = config.tables.messages;
const MEMBERS_TABLE = config.tables.members;
const SUBSCRIBERS_TABLE = config.tables.subscribers;

// Create contact form message - PUBLIC ENDPOINT
router.post('/contact', async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        const contactMessage = {
            id: Date.now().toString(),
            type: 'contact',
            name,
            email,
            phone: phone || null,
            subject: subject || 'Contact Form Submission',
            message,
            status: 'unread',
            createdAt: new Date().toISOString()
        };

        await dynamoDBService.putItem(MESSAGES_TABLE, contactMessage);

        // Send email to admin
        try {
            await emailService.sendContactFormEmail({
                name,
                email,
                phone,
                subject: contactMessage.subject,
                message
            });
        } catch (emailError) {
            console.error('Error sending contact form email:', emailError);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            message: 'Message sent successfully',
            id: contactMessage.id
        });
    } catch (error) {
        console.error('Error creating contact message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all messages (admin inbox)
router.get('/', verifyToken, requireManager, async (req, res) => {
    try {
        const { type, status, includeSent } = req.query;

        let messages = await dynamoDBService.getAllItems(MESSAGES_TABLE);

        // By default, exclude sent messages (broadcasts) from inbox unless explicitly requested
        if (includeSent !== 'true') {
            messages = messages.filter(m => m.status !== 'sent');
        }

        if (type) {
            messages = messages.filter(m => m.type === type);
        }

        if (status) {
            messages = messages.filter(m => m.status === status);
        }

        // Sort by createdAt descending
        messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get sent messages (broadcasts)
router.get('/sent', verifyToken, requireManager, async (req, res) => {
    try {
        let messages = await dynamoDBService.getAllItems(MESSAGES_TABLE);

        // Only get sent broadcast messages
        messages = messages.filter(m => m.type === 'broadcast' && m.status === 'sent');

        // Sort by createdAt descending
        messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(messages);
    } catch (error) {
        console.error('Error fetching sent messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get message stats
router.get('/stats', verifyToken, requireManager, async (req, res) => {
    try {
        const messages = await dynamoDBService.getAllItems(MESSAGES_TABLE);

        const stats = {
            total: messages.length,
            unread: messages.filter(m => m.status === 'unread').length,
            read: messages.filter(m => m.status === 'read').length,
            sent: messages.filter(m => m.status === 'sent').length,
            contact: messages.filter(m => m.type === 'contact').length,
            broadcast: messages.filter(m => m.type === 'broadcast').length
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching message stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Mark message as read
router.patch('/:id/read', verifyToken, requireManager, async (req, res) => {
    try {
        const { id } = req.params;

        // Update message status to read
        const updatedMessage = await dynamoDBService.updateItem(
            MESSAGES_TABLE,
            { id },
            {
                status: 'read',
                readAt: new Date().toISOString()
            }
        );

        console.log('✅ Message marked as read:', id);

        res.json({
            message: 'Message marked as read',
            data: updatedMessage
        });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete message
router.delete('/:id', verifyToken, requireManager, async (req, res) => {
    try {
        const { id } = req.params;

        await dynamoDBService.deleteItem(MESSAGES_TABLE, { id });

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Broadcast message to recipients
router.post('/broadcast', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { subject, message, recipients } = req.body;

        if (!subject || !message || !recipients) {
            return res.status(400).json({ error: 'Subject, message, and recipients are required' });
        }

        // Get recipient emails based on selection
        let emailList = [];

        if (recipients === 'all') {
            // Get all members and subscribers
            const [members, subscribers] = await Promise.all([
                dynamoDBService.getAllItems(MEMBERS_TABLE),
                dynamoDBService.getAllItems(SUBSCRIBERS_TABLE)
            ]);

            emailList = [
                ...members.filter(m => m.email).map(m => m.email),
                ...subscribers.filter(s => s.status === 'active').map(s => s.email)
            ];
        } else if (recipients === 'members') {
            // Get all members
            const members = await dynamoDBService.getAllItems(MEMBERS_TABLE);
            emailList = members.filter(m => m.email).map(m => m.email);
        } else if (recipients === 'life-members') {
            // Get life members only
            const members = await dynamoDBService.getAllItems(MEMBERS_TABLE);
            emailList = members
                .filter(m => m.email && m.membershipType === 'life')
                .map(m => m.email);
        } else if (recipients === 'subscribers') {
            // Get subscribers only
            const subscribers = await dynamoDBService.getAllItems(SUBSCRIBERS_TABLE);
            emailList = subscribers
                .filter(s => s.status === 'active')
                .map(s => s.email);
        }

        // Remove duplicates
        emailList = [...new Set(emailList)];

        // Save broadcast message
        const broadcastMessage = {
            id: Date.now().toString(),
            type: 'broadcast',
            subject,
            message,
            recipients,
            recipientCount: emailList.length,
            status: 'sent',
            createdAt: new Date().toISOString()
        };

        await dynamoDBService.putItem(MESSAGES_TABLE, broadcastMessage);

        // Send emails
        try {
            await emailService.sendBroadcastEmail({
                subject,
                message,
                recipients: emailList
            });
        } catch (emailError) {
            console.error('Error sending broadcast emails:', emailError);
            // Update message status to error
            await dynamoDBService.updateItem(
                MESSAGES_TABLE,
                { id: broadcastMessage.id },
                {
                    status: 'error',
                    errorMessage: emailError.message
                }
            );

            return res.status(500).json({
                error: 'Failed to send broadcast emails',
                details: emailError.message
            });
        }

        res.status(201).json({
            message: 'Broadcast sent successfully',
            recipientCount: emailList.length,
            id: broadcastMessage.id
        });
    } catch (error) {
        console.error('Error broadcasting message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
