const dynamoDBService = require('./dynamodb');
const config = require('../config');

class ProjectsService {
  constructor() {
    this.tableName = config.tables.projects;
  }

  // Get all projects
  async getAll(limit = null) {
    return await dynamoDBService.getAllItems(this.tableName, limit);
  }

  // Get project by ID
  async getById(id) {
    return await dynamoDBService.getItem(this.tableName, { id: parseInt(id) });
  }

  // Get project by slug
  async getBySlug(slug) {
    const items = await dynamoDBService.queryByIndex(
      this.tableName,
      'SlugIndex',
      'slug = :slug',
      { ':slug': slug }
    );
    return items.length > 0 ? items[0] : null;
  }

  // Get featured projects
  async getFeatured() {
    return await dynamoDBService.queryByIndex(
      this.tableName,
      'FeaturedIndex',
      'featured = :featured',
      { ':featured': 'true' }
    );
  }

  // Get projects by status
  async getByStatus(status) {
    return await dynamoDBService.queryByIndex(
      this.tableName,
      'StatusIndex',
      '#status = :status',
      { ':status': status }
    );
  }

  // Get projects by category
  async getByCategory(category) {
    return await dynamoDBService.queryByIndex(
      this.tableName,
      'CategoryIndex',
      'category = :category',
      { ':category': category }
    );
  }

  // Create new project
  async create(projectData) {
    const item = {
      ...projectData,
      id: Date.now(),
      featured: projectData.featured ? 'true' : 'false',
      tags: projectData.tags || [],
      progress: projectData.progress || 0
    };

    return await dynamoDBService.createItem(this.tableName, item);
  }

  // Update project
  async update(id, updates) {
    if (updates.featured !== undefined) {
      updates.featured = updates.featured ? 'true' : 'false';
    }

    return await dynamoDBService.updateItem(
      this.tableName,
      { id: parseInt(id) },
      updates
    );
  }

  // Delete project
  async delete(id) {
    return await dynamoDBService.deleteItem(
      this.tableName,
      { id: parseInt(id) }
    );
  }
}

module.exports = new ProjectsService();
