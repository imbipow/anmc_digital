const dynamoDBService = require('./dynamodb');
const config = require('../config');
const fs = require('fs').promises;
const path = require('path');

class DonationsService {
  constructor() {
    this.tableName = config.tables.donations;
    this.localDataPath = path.join(__dirname, '../data/donations.json');
    this.useDynamoDB = process.env.USE_DYNAMODB === 'true';
  }

  async getLocalData() {
    try {
      const data = await fs.readFile(this.localDataPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading local donations data:', error);
      return [];
    }
  }

  async saveLocalData(data) {
    try {
      await fs.writeFile(this.localDataPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing local donations data:', error);
      throw error;
    }
  }

  async getAll() {
    if (this.useDynamoDB) {
      const donations = await dynamoDBService.getAllItems(this.tableName);
      return donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      const donations = await this.getLocalData();
      return donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  async getById(id) {
    if (this.useDynamoDB) {
      return await dynamoDBService.getItem(this.tableName, { id: parseInt(id) });
    } else {
      const donations = await this.getLocalData();
      return donations.find(donation => donation.id === parseInt(id)) || null;
    }
  }

  async getByStatus(status) {
    if (this.useDynamoDB) {
      const donations = await dynamoDBService.getAllItems(this.tableName);
      return donations
        .filter(donation => donation.paymentStatus === status)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      const donations = await this.getLocalData();
      return donations
        .filter(donation => donation.paymentStatus === status)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  async create(donationData) {
    if (this.useDynamoDB) {
      const donations = await dynamoDBService.getAllItems(this.tableName);
      const newId = donations.length > 0 ? Math.max(...donations.map(d => d.id)) + 1 : 1;

      const newDonation = {
        id: newId,
        ...donationData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return await dynamoDBService.createItem(this.tableName, newDonation);
    } else {
      const donations = await this.getLocalData();
      const newId = donations.length > 0 ? Math.max(...donations.map(d => d.id)) + 1 : 1;

      const newDonation = {
        id: newId,
        ...donationData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      donations.push(newDonation);
      await this.saveLocalData(donations);
      return newDonation;
    }
  }

  async update(id, updates) {
    if (this.useDynamoDB) {
      const donation = await this.getById(id);

      if (!donation) {
        throw new Error('Donation not found');
      }

      return await dynamoDBService.updateItem(
        this.tableName,
        { id: parseInt(id) },
        { ...updates, updatedAt: new Date().toISOString() }
      );
    } else {
      const donations = await this.getLocalData();
      const index = donations.findIndex(donation => donation.id === parseInt(id));

      if (index === -1) {
        throw new Error('Donation not found');
      }

      donations[index] = {
        ...donations[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await this.saveLocalData(donations);
      return donations[index];
    }
  }

  async delete(id) {
    if (this.useDynamoDB) {
      const donation = await this.getById(id);

      if (!donation) {
        throw new Error('Donation not found');
      }

      await dynamoDBService.deleteItem(this.tableName, { id: parseInt(id) });
      return donation;
    } else {
      const donations = await this.getLocalData();
      const index = donations.findIndex(donation => donation.id === parseInt(id));

      if (index === -1) {
        throw new Error('Donation not found');
      }

      const deletedDonation = donations[index];
      donations.splice(index, 1);
      await this.saveLocalData(donations);
      return deletedDonation;
    }
  }

  async getTotalAmount() {
    const donations = await this.getAll();
    const successfulDonations = donations.filter(d => d.paymentStatus === 'succeeded');
    return successfulDonations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
  }

  async getStats() {
    const donations = await this.getAll();
    const total = donations.length;
    const succeeded = donations.filter(d => d.paymentStatus === 'succeeded').length;
    const pending = donations.filter(d => d.paymentStatus === 'pending').length;
    const failed = donations.filter(d => d.paymentStatus === 'failed').length;
    const totalAmount = await this.getTotalAmount();

    return {
      total,
      succeeded,
      pending,
      failed,
      totalAmount
    };
  }
}

module.exports = new DonationsService();
