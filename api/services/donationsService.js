const dynamoDBService = require('./dynamodb');
const config = require('../config');

class DonationsService {
  constructor() {
    this.tableName = config.tables.donations;
  }

  async getAll() {
    const donations = await dynamoDBService.getAllItems(this.tableName);
    return donations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async getById(id) {
    return await dynamoDBService.getItem(this.tableName, { id: parseInt(id) });
  }

  async getByStatus(status) {
    const donations = await dynamoDBService.getAllItems(this.tableName);
    return donations
      .filter(donation => donation.paymentStatus === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async create(donationData) {
    const donations = await dynamoDBService.getAllItems(this.tableName);
    const newId = donations.length > 0 ? Math.max(...donations.map(d => d.id)) + 1 : 1;

    const newDonation = {
      id: newId,
      ...donationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return await dynamoDBService.createItem(this.tableName, newDonation);
  }

  async update(id, updates) {
    const donation = await this.getById(id);

    if (!donation) {
      throw new Error('Donation not found');
    }

    return await dynamoDBService.updateItem(
      this.tableName,
      { id: parseInt(id) },
      { ...updates, updatedAt: new Date().toISOString() }
    );
  }

  async delete(id) {
    const donation = await this.getById(id);

    if (!donation) {
      throw new Error('Donation not found');
    }

    await dynamoDBService.deleteItem(this.tableName, { id: parseInt(id) });
    return donation;
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
