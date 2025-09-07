import homepageService from './homepageService';
import aboutUsService from './aboutUsService';

class ContentService {
  constructor() {
    this.staticMode = true;
  }

  // Homepage content (unified hero and counter data) - Use new RESTful API
  async getHomepageContent() {
    return await homepageService.getHomepage();
  }

  // Legacy method for hero data (maintains backward compatibility)
  async getHeroContent() {
    try {
      const homepageData = await this.getHomepageContent();
      return homepageData.hero || {};
    } catch (error) {
      console.warn('Failed to fetch hero content:', error);
      return {};
    }
  }

  // Legacy method for counters (maintains backward compatibility)
  async getCounters() {
    try {
      const homepageData = await this.getHomepageContent();
      return homepageData.counters || [];
    } catch (error) {
      console.warn('Failed to fetch counters:', error);
      return [];
    }
  }

  // Blog posts (static mock data)
  async getBlogPosts() {
    console.log('Static mode: Returning mock blog posts');
    return [];
  }

  // Blog section content (static mock data)
  async getBlogSectionContent() {
    console.log('Static mode: Returning mock blog section content');
    return {};
  }

  // News articles (static mock data)
  async getNews(featured = false) {
    console.log('Static mode: Returning mock news');
    return [];
  }

  // Events (static mock data)
  async getEvents(featured = false) {
    console.log('Static mode: Returning mock events');
    return [];
  }

  // Projects (static mock data)
  async getProjects(featured = false) {
    console.log('Static mode: Returning mock projects');
    return [];
  }

  // About Us content - Use new RESTful API
  async getAboutUs() {
    return await aboutUsService.getAboutUs();
  }

  // Create default about_us record (static mode - no-op)
  async createAboutUsDefault() {
    console.log('Static mode: About Us default record creation skipped');
  }

  // Facilities (static mock data)
  async getFacilities() {
    console.log('Static mode: Returning mock facilities');
    return [];
  }

  // Contact information (static mock data)
  async getContact() {
    console.log('Static mode: Returning mock contact info');
    return {};
  }

  // Get featured content for homepage
  async getFeaturedContent() {
    try {
      const [news, events, projects] = await Promise.all([
        this.getNews(true),
        this.getEvents(true),
        this.getProjects(true)
      ]);
      
      return {
        news: news.filter(item => item.featured),
        events: events.filter(item => item.featured),
        projects: projects.filter(item => item.featured)
      };
    } catch (error) {
      console.warn('Failed to fetch featured content:', error);
      return { news: [], events: [], projects: [] };
    }
  }

  // Generic method to get any resource (static mock data)
  async getResource(resourceName) {
    console.log(`Static mode: Returning mock ${resourceName}`);
    return [];
  }

  // Method to get single item by ID (static mock data)
  async getById(resourceName, id) {
    console.log(`Static mode: Returning mock ${resourceName} with id ${id}`);
    return null;
  }

  // Admin CRUD operations (static mode - no-op)
  async createItem(type, data) {
    console.log(`Static mode: Create ${type} requested but not persisted:`, data);
    return data;
  }

  async updateItem(id, type, data) {
    console.log(`Static mode: Update ${type} with id ${id} requested but not persisted:`, data);
    return data;
  }

  // Update entire homepage content (hero and counters) - Use new RESTful API
  async updateHomepageContent(data) {
    return await homepageService.updateHomepage(data);
  }

  // Update only hero content
  async updateHeroContent(heroData) {
    try {
      const currentData = await this.getHomepageContent();
      return await this.updateHomepageContent({
        hero: heroData,
        counters: currentData.counters
      });
    } catch (error) {
      console.error('Error updating hero content:', error);
      throw error;
    }
  }

  // Update only counter data
  async updateCounters(countersData) {
    try {
      const currentData = await this.getHomepageContent();
      return await this.updateHomepageContent({
        hero: currentData.hero,
        counters: countersData
      });
    } catch (error) {
      console.error('Error updating counters:', error);
      throw error;
    }
  }

  async deleteItem(id) {
    console.log(`Static mode: Delete item with id ${id} requested but not persisted`);
    return { success: true };
  }
}

const contentService = new ContentService();
export default contentService;