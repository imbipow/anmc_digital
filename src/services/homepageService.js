import API_CONFIG from '../config/api';

class HomepageService {
  constructor() {
    this.dataCache = null;
  }

  // Get homepage content (hero and counters)
  async getHomepage() {
    try {
      if (!this.dataCache) {
        // Fetch homepage data and counters from new API
        const [homepageResponse, countersResponse] = await Promise.all([
          fetch(API_CONFIG.getURL(API_CONFIG.endpoints.homepage)),
          fetch(API_CONFIG.getURL(API_CONFIG.endpoints.counters))
        ]);

        // Check for HTTP errors (404, 500, etc.)
        if (!homepageResponse.ok) {
          throw new Error(`HTTP ${homepageResponse.status}: Failed to fetch homepage data`);
        }
        if (!countersResponse.ok) {
          throw new Error(`HTTP ${countersResponse.status}: Failed to fetch counters data`);
        }

        const homepageData = await homepageResponse.json();
        const countersData = await countersResponse.json();

        // Extract hero data from homepage response
        // The API returns items array, find the 'hero' component
        const heroItem = Array.isArray(homepageData)
          ? homepageData.find(item => item.component === 'hero')
          : null;

        const heroData = heroItem ? heroItem.data : this.getDefaultHero();

        this.dataCache = {
          hero: heroData,
          counters: countersData
        };
      }
      return this.dataCache;
    } catch (error) {
      console.warn('Failed to fetch homepage content:', error);
      return {
        hero: this.getDefaultHero(),
        counters: this.getDefaultCounters()
      };
    }
  }

  // Update homepage content (for static version, just return the data)
  async updateHomepage(homepageData) {
    console.log('Static mode: Homepage update requested but not persisted:', homepageData);
    return homepageData;
  }

  // Get default hero content
  getDefaultHero() {
    return {
      welcomeText: "Welcome to ANMC",
      title: "Building Bridges, Strengthening Communities",
      subtitle: "The Australian Nepalese Multicultural Centre is dedicated to fostering cultural diversity, community engagement, and supporting our members through various programs and initiatives.",
      learnMoreText: "Learn More",
      memberButtonText: "Become a Member"
    };
  }

  // Get default counters
  getDefaultCounters() {
    return [
      { id: 1, count: 1500, suffix: "+", label: "Life Members" },
      { id: 2, count: 15, suffix: "", label: "Acres of Land" },
      { id: 3, count: 2, prefix: "$", suffix: "M+", label: "Funds Raised" },
      { id: 4, count: 2014, suffix: "", label: "Established" }
    ];
  }
}

const homepageService = new HomepageService();
export default homepageService;