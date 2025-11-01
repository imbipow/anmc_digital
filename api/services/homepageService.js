const dynamoDBService = require('./dynamodb');
const config = require('../config');

class HomepageService {
  constructor() {
    this.tableName = config.tables.homepage;
  }

  async getAll() {
    return await dynamoDBService.getAllItems(this.tableName);
  }

  async getById(id) {
    return await dynamoDBService.getItem(this.tableName, { id });
  }

  async getByComponent(component) {
    const items = await dynamoDBService.queryByIndex(
      this.tableName,
      'ComponentIndex',
      'component = :component',
      { ':component': component }
    );
    return items.length > 0 ? items[0] : null;
  }

  async update(id, updates) {
    // For homepage, we need to do a full replacement (PUT) instead of partial update
    // because of the nested data structure
    const AWS = require('aws-sdk');
    const config = require('../config');
    AWS.config.update({
      region: config.aws.region,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    });
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const params = {
      TableName: this.tableName,
      Item: {
        id,
        component: updates.component || 'hero',
        data: updates.data
      }
    };

    try {
      await dynamodb.put(params).promise();
      return params.Item;
    } catch (error) {
      console.error('Error updating homepage:', error);
      throw error;
    }
  }
}

module.exports = new HomepageService();
