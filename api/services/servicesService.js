const dynamoDBService = require('./dynamodb');
const config = require('../config');

class ServicesService {
    constructor() {
        this.tableName = config.tables.services;
    }

    // Get all services
    async getAll() {
        const services = await dynamoDBService.getAllItems(this.tableName);
        return services.sort((a, b) => a.item - b.item);
    }

    // Get service by ID
    async getById(id) {
        return await dynamoDBService.getItem(this.tableName, { id });
    }

    // Create new service
    async create(serviceData) {
        const newService = {
            id: serviceData.id || Date.now().toString(),
            ...serviceData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await dynamoDBService.putItem(this.tableName, newService);
        return newService;
    }

    // Update service
    async update(id, serviceData) {
        const updateData = {
            ...serviceData,
            updatedAt: new Date().toISOString()
        };

        await dynamoDBService.updateItem(this.tableName, { id }, updateData);
        return await this.getById(id);
    }

    // Delete service
    async delete(id) {
        await dynamoDBService.deleteItem(this.tableName, { id });
        return { success: true };
    }
}

module.exports = new ServicesService();
