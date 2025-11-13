const express = require('express');
const router = express.Router();
const servicesService = require('../services/servicesService');

// Get all services
router.get('/', async (req, res, next) => {
    try {
        const services = await servicesService.getAll();
        res.json(services);
    } catch (error) {
        next(error);
    }
});

// Get single service
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const service = await servicesService.getById(id);

        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }

        res.json(service);
    } catch (error) {
        next(error);
    }
});

// Create new service
router.post('/', async (req, res, next) => {
    try {
        const serviceData = req.body;
        const newService = await servicesService.create(serviceData);
        res.status(201).json(newService);
    } catch (error) {
        next(error);
    }
});

// Update service
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const serviceData = req.body;

        const updatedService = await servicesService.update(id, serviceData);
        res.json(updatedService);
    } catch (error) {
        if (error.message === 'Service not found') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
});

// Delete service
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await servicesService.delete(id);
        res.json({ success: true, message: 'Service deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
