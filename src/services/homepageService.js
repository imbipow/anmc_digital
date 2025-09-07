class HomepageService {
  constructor() {
    this.dataCache = null;
  }

  // Get homepage content (hero and counters)
  async getHomepage() {
    try {
      if (!this.dataCache) {
        const response = await fetch('/data/homepage.json');
        this.dataCache = await response.json();
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
      { id: 1, count: 500, suffix: "+", label: "Life Members" },
      { id: 2, count: 25, suffix: "", label: "Acres of Land" },
      { id: 3, count: 2, prefix: "$", suffix: "M+", label: "Funds Raised" },
      { id: 4, count: 1998, suffix: "", label: "Established" }
    ];
  }
}

const homepageService = new HomepageService();
export default homepageService;