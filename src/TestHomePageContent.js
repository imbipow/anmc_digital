import React, { useState, useEffect } from 'react';
import contentService from './services/contentService';

const TestHomePageContent = () => {
    const [heroContent, setHeroContent] = useState(null);
    const [counters, setCounters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadContent = async () => {
            try {
                console.log('Loading homepage content...');
                const hero = await contentService.getHomepageContent();
                const counterData = await contentService.getCounters();
                
                console.log('Hero data:', hero);
                console.log('Counter data:', counterData);
                
                setHeroContent(hero);
                setCounters(counterData);
            } catch (error) {
                console.error('Error loading content:', error);
            } finally {
                setLoading(false);
            }
        };
        loadContent();
    }, []);

    if (loading) {
        return <div>Loading content...</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Homepage Content Test</h2>
            
            <div style={{ marginBottom: '30px' }}>
                <h3>Hero Section</h3>
                <pre>{JSON.stringify(heroContent, null, 2)}</pre>
            </div>
            
            <div>
                <h3>Counters</h3>
                <pre>{JSON.stringify(counters, null, 2)}</pre>
            </div>
        </div>
    );
};

export default TestHomePageContent;