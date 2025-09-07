import React, { useState, useEffect } from 'react';
import contentService from './services/contentService';

const TestAPI = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testType, setTestType] = useState('homepage');

  useEffect(() => {
    testAPI();
  }, [testType]);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let result;
      switch(testType) {
        case 'homepage':
          result = await contentService.getHomepageContent();
          break;
        case 'counters':
          result = await contentService.getCounters();
          break;
        case 'news':
          result = await contentService.getNews();
          break;
        case 'events':
          result = await contentService.getEvents();
          break;
        case 'projects':
          result = await contentService.getProjects();
          break;
        default:
          result = await contentService.getResource(testType);
      }
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('API Test Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testCreate = async () => {
    try {
      const newItem = {
        title: 'Test Item',
        content: 'This is a test item created from the frontend',
        author: 'Test User',
        date: new Date().toISOString(),
        featured: false
      };

      const result = await contentService.createItem('news', newItem);
      console.log('Created item:', result);
      alert('Item created successfully!');
      testAPI(); // Refresh data
    } catch (err) {
      console.error('Create test error:', err);
      alert('Failed to create item: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>API Integration Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          Test Type: 
          <select value={testType} onChange={(e) => setTestType(e.target.value)} style={{ marginLeft: '10px' }}>
            <option value="homepage">Homepage</option>
            <option value="counters">Counters</option>
            <option value="news">News</option>
            <option value="events">Events</option>
            <option value="projects">Projects</option>
            <option value="facilities">Facilities</option>
            <option value="about_us">About Us</option>
            <option value="contact">Contact</option>
          </select>
        </label>
        <button onClick={testAPI} style={{ marginLeft: '10px' }}>Refresh</button>
        <button onClick={testCreate} style={{ marginLeft: '10px' }}>Test Create (News)</button>
      </div>

      {loading && <p>Loading...</p>}
      
      {error && (
        <div style={{ color: 'red', background: '#fee', padding: '10px', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div>
          <h3>Result for {testType}:</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <h4>API Configuration:</h4>
        <p>Endpoint: https://57tr02mr6b.execute-api.ap-southeast-2.amazonaws.com/dev</p>
        <p>Region: ap-southeast-2</p>
        <p>Table: ContentTable-dev</p>
      </div>
    </div>
  );
};

export default TestAPI;