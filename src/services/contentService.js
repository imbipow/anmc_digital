import { get, post, put, del } from 'aws-amplify/api';

class ContentService {
  constructor() {
    this.apiName = 'contentAPI';
  }

  // Homepage content (unified hero and counter data)
  async getHomepageContent() {
    try {
      const restOperation = get({
        apiName: this.apiName,
        path: '/homepage',
        options: {}
      });
      const { body } = await restOperation.response;
      const data = await body.json();
      
      // Return unified homepage data structure
      return {
        hero: data.hero || data.homepage?.[0]?.data || {},
        counters: data.counters || []
      };
    } catch (error) {
      console.warn('Failed to fetch homepage content:', error);
      // Return fallback structure
      return {
        hero: {
          welcomeText: "Welcome to ANMC",
          title: "Building Bridges, Strengthening Communities",
          subtitle: "The Australian Nepalese Multicultural Centre is dedicated to fostering cultural diversity, community engagement, and supporting our members through various programs and initiatives.",
          learnMoreText: "Learn More",
          memberButtonText: "Become a Member"
        },
        counters: [
          { id: 1, count: 500, suffix: "+", label: "Life Members" },
          { id: 2, count: 25, suffix: "", label: "Acres of Land" },
          { id: 3, count: 2, prefix: "$", suffix: "M+", label: "Funds Raised" },
          { id: 4, count: 1998, suffix: "", label: "Established" }
        ]
      };
    }
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

  // Blog posts
  async getBlogPosts() {
    try {
      const restOperation = get({
        apiName: this.apiName,
        path: '/content',
        options: {
          queryStringParameters: {
            type: 'blog_posts'
          }
        }
      });
      const { body } = await restOperation.response;
      return await body.json();
    } catch (error) {
      console.warn('Failed to fetch blog posts:', error);
      return [];
    }
  }

  // Blog section content
  async getBlogSectionContent() {
    try {
      const restOperation = get({
        apiName: this.apiName,
        path: '/content',
        options: {
          queryStringParameters: {
            type: 'blog_section'
          }
        }
      });
      const { body } = await restOperation.response;
      const data = await body.json();
      return data.find(item => item.id === 'blog_section_content') || {};
    } catch (error) {
      console.warn('Failed to fetch blog section content:', error);
      return {};
    }
  }

  // News articles
  async getNews(featured = false) {
    try {
      const queryParams = { type: 'news' };
      if (featured) queryParams.featured = 'true';
      
      const restOperation = get({
        apiName: this.apiName,
        path: '/content',
        options: {
          queryStringParameters: queryParams
        }
      });
      const { body } = await restOperation.response;
      return await body.json();
    } catch (error) {
      console.warn('Failed to fetch news:', error);
      return [];
    }
  }

  // Events
  async getEvents(featured = false) {
    try {
      const queryParams = { type: 'events' };
      if (featured) queryParams.featured = 'true';
      
      const restOperation = get({
        apiName: this.apiName,
        path: '/content',
        options: {
          queryStringParameters: queryParams
        }
      });
      const { body } = await restOperation.response;
      return await body.json();
    } catch (error) {
      console.warn('Failed to fetch events:', error);
      return [];
    }
  }

  // Projects
  async getProjects(featured = false) {
    try {
      const queryParams = { type: 'projects' };
      if (featured) queryParams.featured = 'true';
      
      const restOperation = get({
        apiName: this.apiName,
        path: '/content',
        options: {
          queryStringParameters: queryParams
        }
      });
      const { body } = await restOperation.response;
      return await body.json();
    } catch (error) {
      console.warn('Failed to fetch projects:', error);
      return [];
    }
  }

  // About Us content
  async getAboutUs() {
    try {
      const restOperation = get({
        apiName: this.apiName,
        path: '/content',
        options: {
          queryStringParameters: {
            type: 'about_us'
          }
        }
      });
      const { body } = await restOperation.response;
      const data = await body.json();
      return data.find(item => item.id === 'main') || {};
    } catch (error) {
      console.warn('Failed to fetch about us content:', error);
      return {};
    }
  }

  // Facilities
  async getFacilities() {
    try {
      const restOperation = get({
        apiName: this.apiName,
        path: '/content',
        options: {
          queryStringParameters: {
            type: 'facilities'
          }
        }
      });
      const { body } = await restOperation.response;
      return await body.json();
    } catch (error) {
      console.warn('Failed to fetch facilities:', error);
      return [];
    }
  }

  // Contact information
  async getContact() {
    try {
      const restOperation = get({
        apiName: this.apiName,
        path: '/content',
        options: {
          queryStringParameters: {
            type: 'contact'
          }
        }
      });
      const { body } = await restOperation.response;
      const data = await body.json();
      return data.find(item => item.id === 'main') || {};
    } catch (error) {
      console.warn('Failed to fetch contact info:', error);
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
        news: news.filter(item => item.featured),
        events: events.filter(item => item.featured),
        projects: projects.filter(item => item.featured)
      };
    } catch (error) {
      console.warn('Failed to fetch featured content:', error);
      return { news: [], events: [], projects: [] };
    }
  }

  // Generic method to get any resource
  async getResource(resourceName) {
    try {
      const restOperation = get({
        apiName: this.apiName,
        path: '/content',
        options: {
          queryStringParameters: {
            type: resourceName
          }
        }
      });
      const { body } = await restOperation.response;
      return await body.json();
    } catch (error) {
      console.warn(`Failed to fetch ${resourceName}:`, error);
      return [];
    }
  }

  // Method to get single item by ID
  async getById(resourceName, id) {
    try {
      const restOperation = get({
        apiName: this.apiName,
        path: `/content/${id}`
      });
      const { body } = await restOperation.response;
      return await body.json();
    } catch (error) {
      console.warn(`Failed to fetch ${resourceName} with id ${id}:`, error);
      return null;
    }
  }

  // Admin CRUD operations
  async createItem(type, data) {
    try {
      const restOperation = post({
        apiName: this.apiName,
        path: '/content',
        options: {
          body: {
            type: type,
            ...data,
            created_at: new Date().toISOString()
          }
        }
      });
      const { body } = await restOperation.response;
      return await body.json();
    } catch (error) {
      console.error(`Failed to create ${type}:`, error);
      throw error;
    }
  }

  async updateItem(id, type, data) {
    try {
      const restOperation = put({
        apiName: this.apiName,
        path: `/content/${id}`,
        options: {
          body: {
            type: type,
            ...data,
            updated_at: new Date().toISOString()
          }
        }
      });
      const { body } = await restOperation.response;
      return await body.json();
    } catch (error) {
      console.error(`Failed to update ${type} with id ${id}:`, error);
      throw error;
    }
  }

  // Update entire homepage content (hero and counters)
  async updateHomepageContent(data) {
    try {
      console.log('Calling homepage update endpoint with data:', JSON.stringify(data, null, 2));
      const restOperation = put({
        apiName: this.apiName,
        path: `/homepage`,
        options: {
          body: {
            hero: data.hero || {},
            counters: data.counters || [],
            updated_at: new Date().toISOString()
          }
        }
      });
      const { body } = await restOperation.response;
      const result = await body.json();
      console.log('Homepage update endpoint response:', JSON.stringify(result, null, 2));
      return result;
    } catch (error) {
      console.error('Error updating homepage content:', error);
      throw error;
    }
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
    try {
      const restOperation = del({
        apiName: this.apiName,
        path: `/content/${id}`
      });
      const { body } = await restOperation.response;
      return await body.json();
    } catch (error) {
      console.error(`Failed to delete item with id ${id}:`, error);
      throw error;
    }
  }
}

const contentService = new ContentService();
export default contentService;