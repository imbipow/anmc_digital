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
    // Remove id from updates as it's a key attribute and can't be updated
    const { id, ...updateData } = updates;

    return await dynamoDBService.updateItem(
      this.tableName,
      { id: 'main' },
      updateData
    );
  }
}

module.exports = new ContactService();
