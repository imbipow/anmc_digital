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
    return await dynamoDBService.updateItem(
      this.tableName,
      { id: 'master-plan-2025-2030' },
      updates
    );
  }
}

module.exports = new MasterPlanService();
