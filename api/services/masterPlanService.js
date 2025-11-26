const dynamoDBService = require('./dynamodb');
const config = require('../config');

class MasterPlanService {
  constructor() {
    this.tableName = config.tables.masterPlan;
  }

  async get() {
    return await dynamoDBService.getItem(
      this.tableName,
      { id: 'master-plan-2025-2030' }
    );
  }

  async update(updates) {
    // Remove id from updates as it's a key attribute and can't be updated
    const { id, ...updateData } = updates;

    return await dynamoDBService.updateItem(
      this.tableName,
      { id: 'master-plan-2025-2030' },
      updateData
    );
  }
}

module.exports = new MasterPlanService();
