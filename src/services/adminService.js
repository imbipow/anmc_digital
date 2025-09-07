import contentService from './contentService';

class AdminService {
  // Blog Posts
  async getBlogPosts() {
    return await contentService.getBlogPosts();
  }

  async createBlogPost(data) {
    const id = `blog_${Date.now()}`;
    return await contentService.createItem('blog_posts', {
      id,
      ...data,
      featured: data.featured || false
    });
  }

  async updateBlogPost(id, data) {
    return await contentService.updateItem(id, 'blog_posts', {
      ...data,
      featured: data.featured || false
    });
  }

  async deleteBlogPost(id) {
    return await contentService.deleteItem(id);
  }

  // News
  async getNews() {
    return await contentService.getNews();
  }

  async createNews(data) {
    const id = `news_${Date.now()}`;
    return await contentService.createItem('news', {
      id,
      ...data,
      featured: data.featured || false
    });
  }

  async updateNews(id, data) {
    return await contentService.updateItem(id, 'news', {
      ...data,
      featured: data.featured || false
    });
  }

  async deleteNews(id) {
    return await contentService.deleteItem(id);
  }

  // Events
  async getEvents() {
    return await contentService.getEvents();
  }

  async createEvent(data) {
    const id = `event_${Date.now()}`;
    return await contentService.createItem('events', {
      id,
      ...data,
      featured: data.featured || false
    });
  }

  async updateEvent(id, data) {
    return await contentService.updateItem(id, 'events', {
      ...data,
      featured: data.featured || false
    });
  }

  async deleteEvent(id) {
    return await contentService.deleteItem(id);
  }

  // Projects
  async getProjects() {
    return await contentService.getProjects();
  }

  async createProject(data) {
    const id = `project_${Date.now()}`;
    return await contentService.createItem('projects', {
      id,
      ...data,
      featured: data.featured || false
    });
  }

  async updateProject(id, data) {
    return await contentService.updateItem(id, 'projects', {
      ...data,
      featured: data.featured || false
    });
  }

  async deleteProject(id) {
    return await contentService.deleteItem(id);
  }

  // Counters
  async getCounters() {
    return await contentService.getCounters();
  }

  async createCounter(data) {
    const id = `counter_${Date.now()}`;
    return await contentService.createItem('counters', {
      id,
      ...data
    });
  }

  async updateCounter(id, data) {
    return await contentService.updateItem(id, 'counters', data);
  }

  async deleteCounter(id) {
    return await contentService.deleteItem(id);
  }

  // Facilities
  async getFacilities() {
    return await contentService.getFacilities();
  }

  async createFacility(data) {
    const id = `facility_${Date.now()}`;
    return await contentService.createItem('facilities', {
      id,
      ...data
    });
  }

  async updateFacility(id, data) {
    return await contentService.updateItem(id, 'facilities', data);
  }

  async deleteFacility(id) {
    return await contentService.deleteItem(id);
  }

  // Homepage (unified hero and counters)
  async getHomepage() {
    return await contentService.getHomepageContent();
  }

  async updateHomepage(data) {
    return await contentService.updateHomepageContent(data);
  }

  // Legacy methods for individual updates
  async updateHomepageItem(id, data) {
    return await contentService.updateItem(id, 'homepage', data);
  }

  async updateHeroContent(heroData) {
    return await contentService.updateHeroContent(heroData);
  }

  async updateCountersData(countersData) {
    return await contentService.updateCounters(countersData);
  }

  // About Us
  async getAboutUs() {
    return await contentService.getAboutUs();
  }

  async updateAboutUs(id, data) {
    return await contentService.updateItem(id, 'about_us', data);
  }

  // Contact
  async getContact() {
    return await contentService.getContact();
  }

  async updateContact(id, data) {
    return await contentService.updateItem(id, 'contact', data);
  }

  // Blog Section
  async getBlogSection() {
    return await contentService.getBlogSectionContent();
  }

  async updateBlogSection(id, data) {
    return await contentService.updateItem(id, 'blog_section', data);
  }

  // Generic methods for admin panel
  async getResource(type) {
    return await contentService.getResource(type);
  }

  async getById(type, id) {
    return await contentService.getById(type, id);
  }

  async createItem(type, data) {
    const id = data.id || `${type}_${Date.now()}`;
    return await contentService.createItem(type, { id, ...data });
  }

  async updateItem(id, type, data) {
    return await contentService.updateItem(id, type, data);
  }

  async deleteItem(id) {
    return await contentService.deleteItem(id);
  }

  // Update entire homepage content (primary method)
  async updateHomepageContent(data) {
    return await contentService.updateHomepageContent(data);
  }
}

const adminService = new AdminService();
export default adminService;