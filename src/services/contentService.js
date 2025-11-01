import homepageService from './homepageService';
import aboutUsService from './aboutUsService';
import API_CONFIG from '../config/api';

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

  // Blog posts from API
  async getBlogPosts() {
    try {
      const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.news));
      const news = await response.json();
      return news;
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      return [];
    }
  }

  // Blog section content
  async getBlogSectionContent() {
    try {
      const news = await this.getBlogPosts();
      return {
        sectionTitle: "Latest News & Updates",
        sectionSubtitle: "Stay updated with our community news and announcements",
        posts: news.slice(0, 3)
      };
    } catch (error) {
      console.error('Error fetching blog section content:', error);
      return {};
    }
  }

  // News articles from API
  async getNews(featured = false) {
    try {
      const endpoint = featured
        ? API_CONFIG.endpoints.newsFeatured
        : API_CONFIG.endpoints.news;
      const response = await fetch(API_CONFIG.getURL(endpoint));
      const news = await response.json();
      return news;
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  // Events from API
  async getEvents(featured = false) {
    try {
      const endpoint = featured
        ? API_CONFIG.endpoints.eventsFeatured
        : API_CONFIG.endpoints.events;
      const response = await fetch(API_CONFIG.getURL(endpoint));
      const events = await response.json();
      return events;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  // Projects from API
  async getProjects(featured = false) {
    try {
      const endpoint = featured
        ? API_CONFIG.endpoints.projectsFeatured
        : API_CONFIG.endpoints.projects;
      const response = await fetch(API_CONFIG.getURL(endpoint));
      const projects = await response.json();
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  // About Us content - Use new RESTful API
  async getAboutUs() {
    return await aboutUsService.getAboutUs();
  }

  // Create default about_us record (static mode - no-op)
  async createAboutUsDefault() {
    console.log('Static mode: About Us default record creation skipped');
  }

  // Facilities from API
  async getFacilities() {
    try {
      const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.facilities));
      const facilities = await response.json();
      return facilities;
    } catch (error) {
      console.error('Error fetching facilities:', error);
      return [];
    }
  }

  // Contact information from API
  async getContact() {
    try {
      const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.contact));
      const contact = await response.json();
      return Array.isArray(contact) ? contact[0] : contact;
    } catch (error) {
      console.error('Error fetching contact info:', error);
      return {};
    }
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
        news: news,
        events: events,
        projects: projects
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