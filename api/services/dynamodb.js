const AWS = require('aws-sdk');
const config = require('../config');

// Configure AWS SDK for production vs development
if (process.env.NODE_ENV === 'production') {
  // In production (Elastic Beanstalk), explicitly use EC2 instance metadata for credentials
  AWS.config.credentials = new AWS.EC2MetadataCredentials({
    httpOptions: { timeout: 5000 }, // 5 second timeout
    maxRetries: 10
  });
  AWS.config.region = config.aws.region;
} else {
  // In development, use explicit credentials from environment
  AWS.config.update({
    region: config.aws.region,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
}

const dynamodb = new AWS.DynamoDB.DocumentClient();

class DynamoDBService {
  /**
   * Get item by primary key
   */
  async getItem(tableName, key) {
    const params = {
      TableName: tableName,
      Key: key
    };

    try {
      const result = await dynamodb.get(params).promise();
      return result.Item || null;
    } catch (error) {
      console.error(`Error getting item from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Get all items from table (scan)
   */
  async getAllItems(tableName, limit = null) {
    const params = {
      TableName: tableName
    };

    if (limit) {
      params.Limit = limit;
    }

    try {
      console.log(`Scanning table: ${tableName} with params:`, JSON.stringify(params));
      const result = await dynamodb.scan(params).promise();
      console.log(`Successfully scanned ${tableName}, found ${result.Items?.length || 0} items`);
      return result.Items || [];
    } catch (error) {
      console.error(`Error scanning ${tableName}:`, {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        requestId: error.requestId,
        tableName: tableName,
        region: AWS.config.region
      });
      throw error;
    }
  }

  /**
   * Query items using GSI
   */
  async queryByIndex(tableName, indexName, keyConditionExpression, expressionAttributeValues, scanIndexForward = false) {
    const params = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ScanIndexForward: scanIndexForward
    };

    try {
      const result = await dynamodb.query(params).promise();
      return result.Items || [];
    } catch (error) {
      console.error(`Error querying ${tableName} with index ${indexName}:`, error);
      throw error;
    }
  }

  /**
   * Put item (create or overwrite)
   */
  async putItem(tableName, item) {
    const params = {
      TableName: tableName,
      Item: item
    };

    try {
      await dynamodb.put(params).promise();
      return item;
    } catch (error) {
      console.error(`Error putting item in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Create new item
   */
  async createItem(tableName, item) {
    const params = {
      TableName: tableName,
      Item: item,
      ConditionExpression: 'attribute_not_exists(id)' // Prevent overwriting existing items
    };

    try {
      await dynamodb.put(params).promise();
      return item;
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        throw new Error('Item with this ID already exists');
      }
      console.error(`Error creating item in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update existing item
   */
  async updateItem(tableName, key, updates) {
    // Build update expression
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    Object.keys(updates).forEach((field, index) => {
      const attributeName = `#field${index}`;
      const attributeValue = `:value${index}`;

      updateExpression.push(`${attributeName} = ${attributeValue}`);
      expressionAttributeNames[attributeName] = field;
      expressionAttributeValues[attributeValue] = updates[field];
    });

    const params = {
      TableName: tableName,
      Key: key,
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await dynamodb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error(`Error updating item in ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete item
   */
  async deleteItem(tableName, key) {
    const params = {
      TableName: tableName,
      Key: key,
      ReturnValues: 'ALL_OLD'
    };

    try {
      const result = await dynamodb.delete(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error(`Error deleting item from ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Batch write items
   */
  async batchWrite(tableName, items) {
    const BATCH_SIZE = 25; // DynamoDB limit
    const batches = [];

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      batches.push(items.slice(i, i + BATCH_SIZE));
    }

    try {
      for (const batch of batches) {
        const params = {
          RequestItems: {
            [tableName]: batch.map(item => ({
              PutRequest: { Item: item }
            }))
          }
        };

        await dynamodb.batchWrite(params).promise();
      }

      return { success: true, itemCount: items.length };
    } catch (error) {
      console.error(`Error batch writing to ${tableName}:`, error);
      throw error;
    }
  }

  /**
   * Query with pagination
   */
  async queryWithPagination(tableName, keyConditionExpression, expressionAttributeValues, limit = 10, lastEvaluatedKey = null) {
    const params = {
      TableName: tableName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      Limit: limit
    };

    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }

    try {
      const result = await dynamodb.query(params).promise();
      return {
        items: result.Items || [],
        lastEvaluatedKey: result.LastEvaluatedKey || null,
        hasMore: !!result.LastEvaluatedKey
      };
    } catch (error) {
      console.error(`Error querying ${tableName} with pagination:`, error);
      throw error;
    }
  }
}

module.exports = new DynamoDBService();
