import API_CONFIG from '../config/api';

class AboutUsService {
  constructor() {
    this.dataCache = null;
  }

  // Get about us content
  async getAboutUs() {
    // Always fetch fresh data from new API
    const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.aboutUs));

    // Check for HTTP errors (404, 500, etc.)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch about us data`);
    }

    const aboutUsData = await response.json();

    // Extract the main about us data (DynamoDB returns single item with id)
    const data = Array.isArray(aboutUsData) && aboutUsData.length > 0
      ? aboutUsData[0]
      : aboutUsData;

    return data;
  }

  // Update about us content (for static version, just return the data)
  async updateAboutUs(aboutUsData) {
    console.log('Static mode: About Us update requested but not persisted:', aboutUsData);
    return aboutUsData;
  }
}

const aboutUsService = new AboutUsService();
export default aboutUsService;