// Content API Lambda function with DynamoDB integration
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, QueryCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME || 'ContentTable-dev';

exports.handler = async (event, context) => {
  console.log('Lambda invoked with event:', JSON.stringify(event));
  
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control',
      'Access-Control-Allow-Methods': 'DELETE, GET, OPTIONS, POST, PUT',
      'Content-Type': 'application/json'
    },
    body: ''
  };

  // Handle OPTIONS requests for CORS
  if (event.httpMethod === 'OPTIONS') {
    return response;
  }

  try {
    const path = event.path;
    const method = event.httpMethod;
    const queryParams = event.queryStringParameters || {};

    if (method === 'GET') {
      if (path === '/homepage' || path === '/dev/homepage') {
        // Get unified homepage content
        const homepageData = await getHomepageContent();
        response.body = JSON.stringify(homepageData);
      } else if (path === '/content' || path === '/dev/content') {
        // Get content by type
        if (queryParams.type) {
          const items = await getContentByType(queryParams.type, queryParams);
          response.body = JSON.stringify(items);
        } else {
          // Get all content
          const items = await getAllContent();
          response.body = JSON.stringify(items);
        }
      } else if (path.match(/^\/(?:dev\/)?content\/(.+)$/)) {
        // Get single item by ID
        const id = path.match(/^\/(?:dev\/)?content\/(.+)$/)[1];
        const item = await getContentById(id);
        if (item) {
          response.body = JSON.stringify(item);
        } else {
          response.statusCode = 404;
          response.body = JSON.stringify({ error: 'Content not found' });
        }
      } else {
        response.body = JSON.stringify({ 
          message: 'Content API Root',
          endpoints: [
            'GET /content - Get all content',
            'GET /content?type=homepage - Get content by type',
            'GET /content/{id} - Get content by ID',
            'POST /content - Create content',
            'PUT /content/{id} - Update content',
            'DELETE /content/{id} - Delete content'
          ]
        });
      }
    } else if (method === 'POST') {
      if (path === '/content' || path === '/dev/content') {
        const body = JSON.parse(event.body);
        const item = await createContent(body);
        response.statusCode = 201;
        response.body = JSON.stringify(item);
      }
    } else if (method === 'PUT') {
      if (path === '/homepage' || path === '/dev/homepage') {
        // Update unified homepage content
        const body = JSON.parse(event.body);
        const result = await updateHomepageContent(body);
        response.body = JSON.stringify(result);
      } else {
        const id = path.match(/^\/(?:dev\/)?content\/(.+)$/)?.[1];
        if (id) {
          const body = JSON.parse(event.body);
          const item = await updateContent(id, body);
          response.body = JSON.stringify(item);
        }
      }
    } else if (method === 'DELETE') {
      const id = path.match(/^\/(?:dev\/)?content\/(.+)$/)?.[1];
      if (id) {
        await deleteContent(id);
        response.statusCode = 204;
        response.body = '';
      }
    } else {
      response.statusCode = 405;
      response.body = JSON.stringify({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Error:', error);
    response.statusCode = 500;
    response.body = JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    });
  }

  return response;
};

// DynamoDB helper functions
async function getAllContent() {
  const command = new ScanCommand({
    TableName: TABLE_NAME
  });
  const result = await docClient.send(command);
  return result.Items || [];
}

async function getContentByType(type, filters = {}) {
  const command = new ScanCommand({
    TableName: TABLE_NAME,
    FilterExpression: '#type = :type',
    ExpressionAttributeNames: {
      '#type': 'type'
    },
    ExpressionAttributeValues: {
      ':type': type
    }
  });

  const result = await docClient.send(command);
  let items = result.Items || [];

  // Apply additional filters
  if (filters.featured === 'true') {
    items = items.filter(item => item.featured === true);
  }

  return items;
}

async function getContentById(id) {
  // First try with just ID (for backward compatibility)
  const getCommand = new GetCommand({
    TableName: TABLE_NAME,
    Key: { id: id }
  });
  
  try {
    const result = await docClient.send(getCommand);
    if (result.Item) {
      return result.Item;
    }
    
    // If not found with just ID, search by scanning
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id
      }
    });
    
    const scanResult = await docClient.send(scanCommand);
    if (scanResult.Items && scanResult.Items.length > 0) {
      return scanResult.Items[0];
    }
    
    return null;
  } catch (error) {
    console.error('GetById error:', error);
    return null;
  }
}

async function createContent(data) {
  const id = data.id || `${data.type}_${Date.now()}`;
  const item = {
    id,
    ...data,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const command = new PutCommand({
    TableName: TABLE_NAME,
    Item: item
  });

  await docClient.send(command);
  return item;
}

async function updateContent(id, data) {
  const item = {
    ...data,
    updated_at: new Date().toISOString()
  };

  const command = new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { id: id },
    UpdateExpression: 'SET #data = :data, updated_at = :updated_at',
    ExpressionAttributeNames: {
      '#data': 'data'
    },
    ExpressionAttributeValues: {
      ':data': item,
      ':updated_at': item.updated_at
    },
    ReturnValues: 'ALL_NEW'
  });

  const result = await docClient.send(command);
  return result.Attributes;
}

async function deleteContent(id) {
  console.log(`Attempting to delete item with id: ${id}`);
  console.log(`Using table: ${TABLE_NAME}`);
  
  try {
    // For composite key tables, we need to scan to find the item first
    const scanCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id
      }
    });
    
    console.log('Scanning for item...');
    const scanResult = await docClient.send(scanCommand);
    console.log('Scan result:', JSON.stringify(scanResult, null, 2));
    
    if (scanResult.Items && scanResult.Items.length > 0) {
      const item = scanResult.Items[0];
      console.log(`Found item to delete: ${JSON.stringify(item)}`);
      
      // Delete using composite key (both id and type)
      const deleteCommand = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { 
          id: item.id,
          type: item.type 
        }
      });
      
      console.log(`Deleting with key:`, { id: item.id, type: item.type });
      await docClient.send(deleteCommand);
      console.log('Delete successful');
    } else {
      console.log('Item not found during scan');
      throw new Error(`Item with id ${id} not found`);
    }
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
}

async function getHomepageContent() {
  try {
    console.log('Fetching homepage content...');
    
    // Get hero content
    const heroCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#type = :heroType',
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      ExpressionAttributeValues: {
        ':heroType': 'homepage'
      }
    });
    
    const heroResult = await docClient.send(heroCommand);
    const heroItem = heroResult.Items?.find(item => item.component === 'hero' || item.id?.includes('hero'));
    
    // Get counters content
    const countersCommand = new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: '#type = :countersType',
      ExpressionAttributeNames: {
        '#type': 'type'
      },
      ExpressionAttributeValues: {
        ':countersType': 'counters'
      }
    });
    
    const countersResult = await docClient.send(countersCommand);
    
    // Return unified structure
    return {
      hero: heroItem?.data || {
        welcomeText: "Welcome to ANMC",
        title: "Building Bridges, Strengthening Communities",
        subtitle: "The Australian Nepalese Multicultural Centre is dedicated to fostering cultural diversity, community engagement, and supporting our members through various programs and initiatives.",
        learnMoreText: "Learn More",
        memberButtonText: "Become a Member"
      },
      counters: countersResult.Items || [
        { id: 1, count: 500, suffix: "+", label: "Life Members" },
        { id: 2, count: 25, suffix: "", label: "Acres of Land" },
        { id: 3, count: 2, prefix: "$", suffix: "M+", label: "Funds Raised" },
        { id: 4, count: 1998, suffix: "", label: "Established" }
      ]
    };
  } catch (error) {
    console.error('Error fetching homepage content:', error);
    // Return fallback data
    return {
      hero: {
        welcomeText: "Welcome to ANMC",
        title: "Building Bridges, Strengthening Communities",
        subtitle: "The Australian Nepalese Multicultural Centre is dedicated to fostering cultural diversity, community engagement, and supporting our members through various programs and initiatives.",
        learnMoreText: "Learn More",
        memberButtonText: "Become a Member"
      },
      counters: [
        { id: 1, count: 500, suffix: "+", label: "Life Members" },
        { id: 2, count: 25, suffix: "", label: "Acres of Land" },
        { id: 3, count: 2, prefix: "$", suffix: "M+", label: "Funds Raised" },
        { id: 4, count: 1998, suffix: "", label: "Established" }
      ]
    };
  }
}

async function updateHomepageContent(data) {
  console.log('=== HOMEPAGE UPDATE START ===');
  console.log('Raw data received:', JSON.stringify(data, null, 2));
  console.log('Counters array length:', data.counters ? data.counters.length : 'undefined');
  console.log('Counters data:', JSON.stringify(data.counters, null, 2));
  
  try {
    const results = {};
    
    // Update hero content if provided
    if (data.hero) {
      const heroItem = {
        id: 'hero_main',
        type: 'homepage',
        component: 'hero',
        data: data.hero,
        updated_at: new Date().toISOString()
      };
      
      const heroCommand = new PutCommand({
        TableName: TABLE_NAME,
        Item: heroItem
      });
      
      await docClient.send(heroCommand);
      results.hero = heroItem;
      console.log('Hero content updated');
    }
    
    // Update counters content if provided
    if (data.counters && Array.isArray(data.counters)) {
      // First, get existing counters to avoid duplication
      const existingCountersCommand = new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: '#type = :countersType',
        ExpressionAttributeNames: {
          '#type': 'type'
        },
        ExpressionAttributeValues: {
          ':countersType': 'counters'
        }
      });
      
      const existingCountersResult = await docClient.send(existingCountersCommand);
      const existingCounters = existingCountersResult.Items || [];
      
      // Delete all existing counters using batch operation
      console.log(`Found ${existingCounters.length} existing counters to delete`);
      if (existingCounters.length > 0) {
        // Process in batches of 25 (DynamoDB batch limit)
        const batchSize = 25;
        for (let i = 0; i < existingCounters.length; i += batchSize) {
          const batch = existingCounters.slice(i, i + batchSize);
          const deleteRequests = batch.map(counter => ({
            DeleteRequest: {
              Key: {
                id: counter.id,
                type: counter.type
              }
            }
          }));

          try {
            const batchCommand = new BatchWriteCommand({
              RequestItems: {
                [TABLE_NAME]: deleteRequests
              }
            });
            
            const result = await docClient.send(batchCommand);
            console.log(`Batch delete completed. Unprocessed items:`, result.UnprocessedItems);
          } catch (batchError) {
            console.error('Batch delete error:', batchError);
            // Fallback to individual deletes
            for (const counter of batch) {
              try {
                await docClient.send(new DeleteCommand({
                  TableName: TABLE_NAME,
                  Key: { id: counter.id, type: counter.type }
                }));
              } catch (individualError) {
                console.error(`Failed to delete ${counter.id}:`, individualError);
              }
            }
          }
        }
        
        // Wait for eventual consistency
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('All existing counters deleted');
      }
      
      // Now create new counter items with consistent IDs
      for (let i = 0; i < data.counters.length; i++) {
        const counter = data.counters[i];
        const counterItem = {
          id: `counter_${i + 1}`, // Use consistent numbering
          type: 'counters',
          count: counter.count,
          label: counter.label,
          suffix: counter.suffix || '',
          prefix: counter.prefix || '',
          updated_at: new Date().toISOString()
        };
        
        const counterCommand = new PutCommand({
          TableName: TABLE_NAME,
          Item: counterItem
        });
        
        await docClient.send(counterCommand);
      }
      
      results.counters = data.counters;
      console.log('Counters content updated (replaced all existing counters)');
    }
    
    console.log('=== HOMEPAGE UPDATE COMPLETE ===');
    const finalResult = {
      success: true,
      updated_at: new Date().toISOString(),
      ...results
    };
    console.log('Final result:', JSON.stringify(finalResult, null, 2));
    return finalResult;
    
  } catch (error) {
    console.error('Error updating homepage content:', error);
    throw error;
  }
}