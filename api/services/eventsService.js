const dynamoDBService = require('./dynamodb');
const config = require('../config');

class EventsService {
  constructor() {
    this.tableName = config.tables.events;
  }

  // Get all events
  async getAll(limit = null) {
    return await dynamoDBService.getAllItems(this.tableName, limit);
  }

  // Get event by ID
  async getById(id) {
    return await dynamoDBService.getItem(this.tableName, { id: parseInt(id) });
  }

  // Get event by slug
  async getBySlug(slug) {
    const items = await dynamoDBService.queryByIndex(
      this.tableName,
      'SlugIndex',
      'slug = :slug',
      { ':slug': slug }
    );
    return items.length > 0 ? items[0] : null;
  }

  // Get featured events
  async getFeatured() {
    // Since Events table doesn't have a FeaturedIndex GSI,
    // we need to scan all items and filter client-side
    const allEvents = await this.getAll();
    return allEvents.filter(event =>
      event.featured === true || event.featured === 'true'
    );
  }

  // Get upcoming events
  async getUpcoming() {
    const today = new Date().toISOString().split('T')[0];
    return await dynamoDBService.queryByIndex(
      this.tableName,
      'StatusDateIndex',
      '#status = :status AND startDate >= :today',
      { ':status': 'upcoming', ':today': today },
      true // ASC order by startDate
    );
  }

  // Get past events
  async getPast(limit = 10) {
    const today = new Date().toISOString().split('T')[0];
    return await dynamoDBService.queryByIndex(
      this.tableName,
      'StatusDateIndex',
      '#status = :status AND startDate < :today',
      { ':status': 'past', ':today': today },
      false // DESC order by startDate
    );
  }

  // Get events by category
  async getByCategory(category) {
    return await dynamoDBService.queryByIndex(
      this.tableName,
      'CategoryDateIndex',
      'category = :category',
      { ':category': category },
      false // DESC order by startDate
    );
  }

  // Create new event
  async create(eventData) {
    const item = {
      ...eventData,
      id: Date.now(),
      featured: eventData.featured || false,
      tags: eventData.tags || [],
      registrationRequired: eventData.registrationRequired || false,
      galleryLink: eventData.galleryLink || '',
      registrationLink: eventData.registrationLink || ''
    };

    return await dynamoDBService.createItem(this.tableName, item);
  }

  // Update event
  async update(id, updates) {
    return await dynamoDBService.updateItem(
      this.tableName,
      { id: parseInt(id) },
      updates
    );
  }

  // Delete event
  async delete(id) {
    return await dynamoDBService.deleteItem(
      this.tableName,
      { id: parseInt(id) }
    );
  }
}

module.exports = new EventsService();
