const express = require('express');
const router = express.Router();
const dynamoDBService = require('../services/dynamodb');
const config = require('../config');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const SUBSCRIBERS_TABLE = config.tables.subscribers;

// Subscribe to newsletter
router.post('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Check if already subscribed
        const existing = await dynamoDBService.getItem(SUBSCRIBERS_TABLE, { email });
        if (existing) {
            return res.status(200).json({
                message: 'Already subscribed',
                subscriber: existing
            });
        }

        const subscriber = {
            email,
            name: name || null,
            status: 'active',
            createdAt: new Date().toISOString(),
            source: 'website'
        };

        await dynamoDBService.putItem(SUBSCRIBERS_TABLE, subscriber);

        res.status(201).json({
            message: 'Successfully subscribed to newsletter',
            subscriber
        });
    } catch (error) {
        console.error('Error creating subscriber:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all subscribers (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.query;

        let subscribers = await dynamoDBService.getAllItems(SUBSCRIBERS_TABLE);

        if (status) {
            subscribers = subscribers.filter(s => s.status === status);
        }

        res.json(subscribers);
    } catch (error) {
        console.error('Error fetching subscribers:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get subscriber stats
router.get('/stats', verifyToken, requireAdmin, async (req, res) => {
    try {
        const subscribers = await dynamoDBService.getAllItems(SUBSCRIBERS_TABLE);

        const stats = {
            total: subscribers.length,
            active: subscribers.filter(s => s.status === 'active').length,
            unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching subscriber stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Unsubscribe
router.post('/unsubscribe', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const subscriber = await dynamoDBService.getItem(SUBSCRIBERS_TABLE, { email });

        if (!subscriber) {
            return res.status(404).json({ error: 'Subscriber not found' });
        }

        await dynamoDBService.updateItem(
            SUBSCRIBERS_TABLE,
            { email },
            'SET #status = :status, updatedAt = :updatedAt',
            {
                '#status': 'status'
            },
            {
                ':status': 'unsubscribed',
                ':updatedAt': new Date().toISOString()
            }
        );

        res.json({ message: 'Successfully unsubscribed' });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete subscriber (admin only)
router.delete('/:email', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { email } = req.params;

        await dynamoDBService.deleteItem(SUBSCRIBERS_TABLE, { email });

        res.json({ message: 'Subscriber deleted successfully' });
    } catch (error) {
        console.error('Error deleting subscriber:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
