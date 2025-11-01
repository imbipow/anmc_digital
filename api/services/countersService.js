const dynamoDBService = require('./dynamodb');
const config = require('../config');

class CountersService {
  constructor() {
    this.tableName = config.tables.counters;
  }

  async getAll() {
    return await dynamoDBService.getAllItems(this.tableName);
  }

  async getById(id) {
    return await dynamoDBService.getItem(this.tableName, { id: parseInt(id) });
  }

  async update(id, updates) {
    return await dynamoDBService.updateItem(
      this.tableName,
      { id: parseInt(id) },
      updates
    );
  }
}

module.exports = new CountersService();
