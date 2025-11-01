const dynamoDBService = require('./dynamodb');
const config = require('../config');

class FacilitiesService {
  constructor() {
    this.tableName = config.tables.facilities;
  }

  async getAll() {
    return await dynamoDBService.getAllItems(this.tableName);
  }

  async getById(id) {
    return await dynamoDBService.getItem(this.tableName, { id });
  }

  async create(facilityData) {
    return await dynamoDBService.createItem(this.tableName, facilityData);
  }

  async update(id, updates) {
    return await dynamoDBService.updateItem(this.tableName, { id }, updates);
  }

  async delete(id) {
    return await dynamoDBService.deleteItem(this.tableName, { id });
  }
}

module.exports = new FacilitiesService();
