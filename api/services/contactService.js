const dynamoDBService = require('./dynamodb');
const config = require('../config');

class ContactService {
  constructor() {
    this.tableName = config.tables.contact;
  }

  async get() {
    return await dynamoDBService.getItem(this.tableName, { id: 'main' });
  }

  async update(updates) {
    return await dynamoDBService.updateItem(
      this.tableName,
      { id: 'main' },
      updates
    );
  }
}

module.exports = new ContactService();
