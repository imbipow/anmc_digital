const dynamoDBService = require('./dynamodb');
const config = require('../config');
const fs = require('fs').promises;
const path = require('path');

class FaqsService {
  constructor() {
    this.tableName = config.tables.faqs;
    this.localDataPath = path.join(__dirname, '../data/faqs.json');
    this.useDynamoDB = process.env.USE_DYNAMODB === 'true';
  }

  async getLocalData() {
    try {
      const data = await fs.readFile(this.localDataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading local FAQ data:', error);
      return [];
    }
  }

  async saveLocalData(data) {
    try {
      await fs.writeFile(this.localDataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing local FAQ data:', error);
      throw error;
    }
  }

  async getAll() {
    if (this.useDynamoDB) {
      const faqs = await dynamoDBService.getAllItems(this.tableName);
      return faqs
        .filter(faq => faq.status === 'published')
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      const faqs = await this.getLocalData();
      return faqs
        .filter(faq => faq.status === 'published')
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  }

  async getById(id) {
    if (this.useDynamoDB) {
      return await dynamoDBService.getItem(this.tableName, { id: parseInt(id) });
    } else {
      const faqs = await this.getLocalData();
      return faqs.find(faq => faq.id === parseInt(id)) || null;
    }
  }

  async getByCategory(category) {
    if (this.useDynamoDB) {
      const faqs = await dynamoDBService.getAllItems(this.tableName);
      return faqs
        .filter(faq => faq.category === category && faq.status === 'published')
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      const faqs = await this.getLocalData();
      return faqs
        .filter(faq => faq.category === category && faq.status === 'published')
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  }

  async create(faqData) {
    if (this.useDynamoDB) {
      const faqs = await dynamoDBService.getAllItems(this.tableName);
      const newId = faqs.length > 0 ? Math.max(...faqs.map(f => f.id)) + 1 : 1;

      const newFaq = {
        id: newId,
        ...faqData,
        status: faqData.status || 'published',
        order: faqData.order || newId
      };

      return await dynamoDBService.createItem(this.tableName, newFaq);
    } else {
      const faqs = await this.getLocalData();
      const newId = faqs.length > 0 ? Math.max(...faqs.map(f => f.id)) + 1 : 1;

      const newFaq = {
        id: newId,
        ...faqData,
        status: faqData.status || 'published',
        order: faqData.order || newId
      };

      faqs.push(newFaq);
      await this.saveLocalData(faqs);
      return newFaq;
    }
  }

  async update(id, updates) {
    if (this.useDynamoDB) {
      const faq = await this.getById(id);

      if (!faq) {
        throw new Error('FAQ not found');
      }

      return await dynamoDBService.updateItem(
        this.tableName,
        { id: parseInt(id) },
        updates
      );
    } else {
      const faqs = await this.getLocalData();
      const index = faqs.findIndex(faq => faq.id === parseInt(id));

      if (index === -1) {
        throw new Error('FAQ not found');
      }

      faqs[index] = { ...faqs[index], ...updates };
      await this.saveLocalData(faqs);
      return faqs[index];
    }
  }

  async delete(id) {
    if (this.useDynamoDB) {
      const faq = await this.getById(id);

      if (!faq) {
        throw new Error('FAQ not found');
      }

      await dynamoDBService.deleteItem(this.tableName, { id: parseInt(id) });
      return faq;
    } else {
      const faqs = await this.getLocalData();
      const index = faqs.findIndex(faq => faq.id === parseInt(id));

      if (index === -1) {
        throw new Error('FAQ not found');
      }

      const deletedFaq = faqs[index];
      faqs.splice(index, 1);
      await this.saveLocalData(faqs);
      return deletedFaq;
    }
  }

  async getCategories() {
    if (this.useDynamoDB) {
      const faqs = await dynamoDBService.getAllItems(this.tableName);
      const categories = [...new Set(faqs.map(faq => faq.category))];
      return categories;
    } else {
      const faqs = await this.getLocalData();
      const categories = [...new Set(faqs.map(faq => faq.category))];
      return categories;
    }
  }
}

module.exports = new FaqsService();
