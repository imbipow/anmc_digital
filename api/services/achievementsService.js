const dynamoDBService = require('./dynamodb');
const config = require('../config');

class AchievementsService {
  constructor() {
    this.tableName = config.tables.projectAchievements;
  }

  async getAll() {
    return await dynamoDBService.getAllItems(this.tableName);
  }

  async getByYear(year) {
    return await dynamoDBService.getItem(this.tableName, { year: year.toString() });
  }

  async getByCategory(category) {
    return await dynamoDBService.queryByIndex(
      this.tableName,
      'CategoryIndex',
      'category = :category',
      { ':category': category },
      true // ASC order by year
    );
  }

  async create(achievementData) {
    return await dynamoDBService.createItem(this.tableName, achievementData);
  }

  async update(year, updates) {
    return await dynamoDBService.updateItem(
      this.tableName,
      { year: year.toString() },
      updates
    );
  }

  async delete(year) {
    return await dynamoDBService.deleteItem(
      this.tableName,
      { year: year.toString() }
    );
  }
}

module.exports = new AchievementsService();
