import adminService from '../services/adminService';

// Custom data provider for React Admin that works with DynamoDB
const dataProvider = {
  getList: async (resource, params) => {
    try {
      let data;
      
      switch (resource) {
        case 'homepage_content':
          // Use the unified homepage endpoint
          const homepageContentData = await adminService.getHomepage();
          console.log('Homepage content data from unified endpoint:', homepageContentData);
          
          // Create single combined record
          data = [{
            id: 'homepage_all',
            type: 'homepage_content',
            hero: homepageContentData.hero || {},
            counters: homepageContentData.counters || []
          }];
          
          console.log('Formatted homepage content data:', data);
          break;
        case 'homepage_hero':
          // Get homepage data and filter for hero component
          data = await adminService.getResource('homepage');
          console.log('Raw homepage data:', data);
          data = data.filter(item => item.component === 'hero' || (item.data && item.data.component === 'hero'));
          console.log('Filtered homepage hero data:', data);
          break;
        case 'homepage_counters':
          // Get counters data and filter for counter type
          data = await adminService.getResource('counters');
          console.log('Raw counters data:', data);
          data = data.filter(item => item.type === 'counters' || (item.data && item.data.type === 'counters'));
          console.log('Filtered counter data:', data);
          break;
        case 'blog_posts':
          data = await adminService.getBlogPosts();
          break;
        case 'news':
          data = await adminService.getNews();
          break;
        case 'events':
          data = await adminService.getEvents();
          break;
        case 'projects':
          data = await adminService.getProjects();
          break;
        case 'facilities':
          data = await adminService.getFacilities();
          break;
        case 'about_us':
          // Get about_us data and create a single record if none exists
          const aboutData = await adminService.getAboutUs();
          data = aboutData && Object.keys(aboutData).length > 0 
            ? [{ ...aboutData, id: 'main' }] 
            : [{
                id: 'main',
                mission: { title: 'Our Mission', content: '', icon: 'fa fa-bullseye' },
                vision: { title: 'Our Vision', content: '', icon: 'fa fa-eye' },
                history: { title: 'Our History', content: '', icon: 'fa fa-history' },
                executiveCommittee: {
                  title: 'Executive Committee',
                  subtitle: 'Meet our dedicated leadership team',
                  members: []
                },
                governance: {
                  title: 'Governance Structure',
                  subtitle: 'Our organizational leadership framework',
                  structure: []
                }
              }];
          break;
        default:
          data = [];
      }

      // Ensure data is an array and has proper id field
      const processedData = Array.isArray(data) ? data.map(item => ({
        ...item,
        id: item.id || `${resource}_${Math.random().toString(36).substr(2, 9)}`
      })) : [];

      return {
        data: processedData,
        total: processedData.length
      };
    } catch (error) {
      console.error(`Failed to get list for ${resource}:`, error);
      return { data: [], total: 0 };
    }
  },

  getOne: async (resource, params) => {
    try {
      let data;
      const { id } = params;

      switch (resource) {
        case 'homepage_content':
          // Use the unified homepage endpoint for getOne as well
          const unifiedHomepageData = await adminService.getHomepage();
          console.log('Unified homepage data for getOne:', unifiedHomepageData);
          
          // Create combined record
          data = {
            id: 'homepage_all',
            type: 'homepage_content',
            hero: unifiedHomepageData.hero || {},
            counters: unifiedHomepageData.counters || []
          };
          break;
        case 'homepage_hero':
          // Get homepage data and find the specific hero item
          const homepageData = await adminService.getResource('homepage');
          data = homepageData.find(item => item.id === id);
          break;
        case 'homepage_counters':
          data = await adminService.getById('counters', id);
          break;
        case 'about_us':
          // Get about_us data or create default structure
          const aboutUsData = await adminService.getAboutUs();
          data = aboutUsData && Object.keys(aboutUsData).length > 0 
            ? { ...aboutUsData, id: 'main' }
            : {
                id: 'main',
                mission: { 
                  title: 'Our Mission', 
                  content: 'To foster cultural diversity and strengthen community bonds through programs that celebrate Nepalese heritage while promoting integration and multicultural understanding in Australia.', 
                  icon: 'fa fa-bullseye' 
                },
                vision: { 
                  title: 'Our Vision', 
                  content: 'To be Australia\'s leading multicultural centre that bridges communities, preserves cultural identity, and creates opportunities for growth, learning, and mutual respect among diverse populations.', 
                  icon: 'fa fa-eye' 
                },
                history: { 
                  title: 'Our History', 
                  content: 'Established to serve the growing Nepalese community in Australia, ANMC has evolved into a vibrant multicultural hub, organizing events, providing support services, and fostering community connections since our inception.', 
                  icon: 'fa fa-history' 
                },
                executiveCommittee: {
                  title: 'Executive Committee',
                  subtitle: 'Meet our dedicated leadership team',
                  members: [
                    { title: 'President', position: 'Executive Leadership', description: 'Leading the organization\'s strategic direction and community outreach initiatives while fostering partnerships and growth opportunities.' },
                    { title: 'Vice President', position: 'Operations Management', description: 'Supporting organizational operations and coordinating community programs to ensure effective service delivery and member engagement.' },
                    { title: 'Secretary', position: 'Administrative Affairs', description: 'Managing organizational documentation, communications, and ensuring compliance with governance requirements and community standards.' },
                    { title: 'Treasurer', position: 'Financial Management', description: 'Overseeing financial planning, budget management, and ensuring transparent financial practices for sustainable organizational growth.' }
                  ]
                },
                governance: {
                  title: 'Governance Structure',
                  subtitle: 'Our organizational leadership framework',
                  structure: [
                    { title: 'Presidential Council', description: 'The Presidential Council provides strategic guidance and oversight, ensuring organizational alignment with community needs and long-term sustainability goals.', icon: 'fa fa-gavel' },
                    { title: 'Patrons', description: 'Distinguished community leaders who lend their expertise and support, helping to advance our mission and strengthen community partnerships.', icon: 'fa fa-shield' },
                    { title: 'Advisors', description: 'Experienced professionals providing specialized knowledge and guidance across various domains to enhance our programs and community impact.', icon: 'fa fa-users' }
                  ]
                }
              };
          break;
        case 'contact':
          data = await adminService.getContact();
          break;
        default:
          // For other resources, try to get by ID
          data = await adminService.getById(resource, id) || { id };
      }

      // Return data in the format React Admin expects
      if (!data) {
        return { data: { id } };
      }
      
      // If data already has the correct structure, use it
      if (data.data && typeof data.data === 'object') {
        return { data: { ...data, id } };
      }
      
      // Otherwise wrap the data
      return { data: { ...data, id } };
    } catch (error) {
      console.error(`Failed to get one ${resource}:`, error);
      throw error;
    }
  },

  create: async (resource, params) => {
    try {
      let data;
      const { data: requestData } = params;

      switch (resource) {
        case 'blog_posts':
          data = await adminService.createBlogPost(requestData);
          break;
        case 'news':
          data = await adminService.createNews(requestData);
          break;
        case 'events':
          data = await adminService.createEvent(requestData);
          break;
        case 'projects':
          data = await adminService.createProject(requestData);
          break;
        case 'homepage_content':
          throw new Error('Create not supported for homepage_content. Use edit to update existing content.');
        case 'homepage_hero':
          data = await adminService.createItem('homepage', requestData);
          break;
        case 'homepage_counters':
          data = await adminService.createItem('counters', requestData);
          break;
        case 'facilities':
          data = await adminService.createFacility(requestData);
          break;
        default:
          throw new Error(`Create not supported for resource: ${resource}`);
      }

      return { data };
    } catch (error) {
      console.error(`Failed to create ${resource}:`, error);
      throw error;
    }
  },

  update: async (resource, params) => {
    try {
      let data;
      const { id, data: requestData } = params;

      switch (resource) {
        case 'blog_posts':
          data = await adminService.updateBlogPost(id, requestData);
          break;
        case 'news':
          data = await adminService.updateNews(id, requestData);
          break;
        case 'events':
          data = await adminService.updateEvent(id, requestData);
          break;
        case 'projects':
          data = await adminService.updateProject(id, requestData);
          break;
        case 'homepage_content':
          // Use dedicated homepage content update endpoint
          console.log('Updating homepage_content with data:', JSON.stringify(requestData, null, 2));
          
          try {
            // Call the dedicated homepage update endpoint
            const result = await adminService.updateHomepageContent(requestData);
            console.log('Homepage update result:', JSON.stringify(result, null, 2));
            
            // Return the combined data structure
            data = {
              id: 'homepage_all',
              type: 'homepage_content',
              hero: requestData.hero || {},
              counters: requestData.counters || [],
              ...result
            };
            console.log('Final data result:', JSON.stringify(data, null, 2));
          } catch (error) {
            console.error('Error in homepage_content update:', error);
            throw error;
          }
          break;
        case 'homepage_hero':
          // Ensure data structure is correct for homepage hero
          console.log('Updating homepage_hero with data:', requestData);
          const heroData = {
            component: 'hero',
            data: requestData.data || requestData,
            type: 'homepage'
          };
          console.log('Formatted hero data:', heroData);
          data = await adminService.updateItem(id, 'homepage', heroData);
          console.log('Update result:', data);
          break;
        case 'homepage_counters':
          // Route individual counter updates through the homepage endpoint to prevent duplicates
          console.log('Updating individual counter via homepage endpoint:', requestData);
          
          // Get current homepage data
          const currentHomepageData = await adminService.getHomepage();
          console.log('Current homepage data:', currentHomepageData);
          
          // Update the specific counter in the array
          let updatedCounters = [...(currentHomepageData.counters || [])];
          const counterIndex = updatedCounters.findIndex(c => c.id === id || `counter_${c.id}` === id);
          
          if (counterIndex >= 0) {
            // Update existing counter
            updatedCounters[counterIndex] = {
              ...updatedCounters[counterIndex],
              ...requestData.data || requestData
            };
          } else {
            // Add new counter
            updatedCounters.push({
              id: updatedCounters.length + 1,
              ...requestData.data || requestData
            });
          }
          
          // Update via homepage endpoint to prevent duplicates
          const result = await adminService.updateHomepageContent({
            hero: currentHomepageData.hero,
            counters: updatedCounters
          });
          
          console.log('Individual counter update result:', result);
          data = result;
          break;
        case 'facilities':
          data = await adminService.updateFacility(id, requestData);
          break;
        case 'homepage':
          data = await adminService.updateItem(id, 'homepage', requestData);
          break;
        case 'about_us':
          data = await adminService.updateAboutUs(id, requestData);
          break;
        case 'contact':
          data = await adminService.updateContact(id, requestData);
          break;
        case 'blog_section':
          data = await adminService.updateBlogSection(id, requestData);
          break;
        default:
          throw new Error(`Update not supported for resource: ${resource}`);
      }

      return { data: { ...data, id } };
    } catch (error) {
      console.error(`Failed to update ${resource}:`, error);
      throw error;
    }
  },

  delete: async (resource, params) => {
    try {
      const { id } = params;
      
      switch (resource) {
        case 'blog_posts':
          await adminService.deleteBlogPost(id);
          break;
        case 'news':
          await adminService.deleteNews(id);
          break;
        case 'events':
          await adminService.deleteEvent(id);
          break;
        case 'projects':
          await adminService.deleteProject(id);
          break;
        case 'homepage_content':
          // Delete from appropriate resource
          await adminService.deleteItem(id);
          break;
        case 'homepage_hero':
          // Delete from homepage resource
          await adminService.deleteItem(id);
          break;
        case 'homepage_counters':
          await adminService.deleteItem(id);
          break;
        case 'counters':
          await adminService.deleteItem(id);
          break;
        case 'homepage':
          await adminService.deleteItem(id);
          break;
        case 'facilities':
          await adminService.deleteFacility(id);
          break;
        default:
          throw new Error(`Delete not supported for resource: ${resource}`);
      }

      return { data: { id } };
    } catch (error) {
      console.error(`Failed to delete ${resource}:`, error);
      throw error;
    }
  },

  deleteMany: async (resource, params) => {
    try {
      const { ids } = params;
      const results = [];

      for (const id of ids) {
        await dataProvider.delete(resource, { id });
        results.push(id);
      }

      return { data: results };
    } catch (error) {
      console.error(`Failed to delete many ${resource}:`, error);
      throw error;
    }
  }
};

export default dataProvider;