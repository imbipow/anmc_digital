const { DynamoDB } = require('aws-sdk');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new DynamoDB.DocumentClient({
  region: config.aws.region,
  ...(config.aws.accessKeyId && config.aws.secretAccessKey
    ? {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      }
    : {}),
});

const TABLE_NAME = `anmc-hero-slides-${process.env.ENVIRONMENT || 'dev'}`;

class HeroSlidesService {
  /**
   * Get all hero slides
   */
  async getAll() {
    const params = {
      TableName: TABLE_NAME,
    };

    const result = await dynamodb.scan(params).promise();

    // Sort by order field
    const slides = result.Items.sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : 999;
      const orderB = b.order !== undefined ? b.order : 999;
      return orderA - orderB;
    });

    return slides;
  }

  /**
   * Get active hero slides only
   */
  async getActive() {
    const allSlides = await this.getAll();
    return allSlides.filter(slide => slide.active !== false);
  }

  /**
   * Get hero slide by ID
   */
  async getById(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
    };

    const result = await dynamodb.get(params).promise();
    return result.Item;
  }

  /**
   * Create new hero slide
   */
  async create(slideData) {
    const id = uuidv4();
    const timestamp = new Date().toISOString();

    const slide = {
      id,
      title: slideData.title || '',
      subtitle: slideData.subtitle || '',
      welcomeText: slideData.welcomeText || 'Welcome to ANMC',
      buttonText: slideData.buttonText || 'Learn More',
      buttonLink: slideData.buttonLink || '/about',
      secondaryButtonText: slideData.secondaryButtonText || '',
      secondaryButtonLink: slideData.secondaryButtonLink || '',
      imageUrl: slideData.imageUrl || '',
      order: slideData.order !== undefined ? slideData.order : 0,
      active: slideData.active !== false, // Default to true
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const params = {
      TableName: TABLE_NAME,
      Item: slide,
    };

    await dynamodb.put(params).promise();
    return slide;
  }

  /**
   * Update hero slide
   */
  async update(id, updates) {
    const existingSlide = await this.getById(id);
    if (!existingSlide) {
      throw new Error('Hero slide not found');
    }

    const updatedSlide = {
      ...existingSlide,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    const params = {
      TableName: TABLE_NAME,
      Item: updatedSlide,
    };

    await dynamodb.put(params).promise();
    return updatedSlide;
  }

  /**
   * Delete hero slide
   */
  async delete(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
    };

    await dynamodb.delete(params).promise();
    return { success: true, id };
  }

  /**
   * Reorder slides
   */
  async reorder(slideOrders) {
    // slideOrders is an array of { id, order }
    const updatePromises = slideOrders.map(({ id, order }) =>
      this.update(id, { order })
    );

    await Promise.all(updatePromises);
    return { success: true };
  }
}

module.exports = new HeroSlidesService();
