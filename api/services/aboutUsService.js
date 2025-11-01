const dynamoDBService = require('./dynamodb');
const config = require('../config');

class AboutUsService {
  constructor() {
    this.tableName = config.tables.aboutUs;
  }

  async get() {
    const item = await dynamoDBService.getItem(this.tableName, { id: 'main' });
    return item;
  }

  async update(updates) {
    // Remove id from updates since it's the partition key and cannot be updated
    const { id, ...updateData } = updates;

    // If no fields to update after removing id, return the current data
    if (Object.keys(updateData).length === 0) {
      return await this.get();
    }

    return await dynamoDBService.updateItem(
      this.tableName,
      { id: 'main' },
      updateData
    );
  }
}

module.exports = new AboutUsService();
