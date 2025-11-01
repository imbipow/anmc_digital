const dynamoDBService = require('./dynamodb');
const config = require('../config');

class NewsService {
  constructor() {
    this.tableName = config.tables.news;
  }

  // Get all news articles
  async getAll(limit = null) {
    return await dynamoDBService.getAllItems(this.tableName, limit);
  }

  // Get news by ID
  async getById(id) {
    return await dynamoDBService.getItem(this.tableName, { id: parseInt(id) });
  }

  // Get news by slug
  async getBySlug(slug) {
    const items = await dynamoDBService.queryByIndex(
      this.tableName,
      'SlugIndex',
      'slug = :slug',
      { ':slug': slug }
    );
    return items.length > 0 ? items[0] : null;
  }

  // Get featured news
  async getFeatured() {
    return await dynamoDBService.queryByIndex(
      this.tableName,
      'FeaturedIndex',
      'featured = :featured',
      { ':featured': 'true' },
      false // DESC order by publishedAt
    );
  }

  // Get news by category
  async getByCategory(category, limit = 10) {
    return await dynamoDBService.queryByIndex(
      this.tableName,
      'CategoryDateIndex',
      'category = :category',
      { ':category': category },
      false // DESC order by publishedAt
    );
  }

  // Create new news article
  async create(newsData) {
    const item = {
      ...newsData,
      id: Date.now(), // Generate unique ID
      featured: newsData.featured ? 'true' : 'false',
      publishedAt: newsData.publishedAt || new Date().toISOString(),
      tags: newsData.tags || []
    };

    return await dynamoDBService.createItem(this.tableName, item);
  }

  // Update news article
  async update(id, updates) {
    // Convert featured to string if present
    if (updates.featured !== undefined) {
      updates.featured = updates.featured ? 'true' : 'false';
    }

    return await dynamoDBService.updateItem(
      this.tableName,
      { id: parseInt(id) },
      updates
    );
  }

  // Delete news article
  async delete(id) {
    return await dynamoDBService.deleteItem(
      this.tableName,
      { id: parseInt(id) }
    );
  }
}

module.exports = new NewsService();
