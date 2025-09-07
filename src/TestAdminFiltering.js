import React, { useState, useEffect } from 'react';
import dataProvider from './admin/dataProvider';

const TestAdminFiltering = () => {
    const [homepageData, setHomepageData] = useState([]);
    const [countersData, setCountersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const testFiltering = async () => {
            try {
                console.log('Testing admin filtering...');
                
                // Test homepage_hero resource (should only return hero content)
                const homepageResult = await dataProvider.getList('homepage_hero', {});
                console.log('Homepage hero result:', homepageResult);
                setHomepageData(homepageResult.data);

                // Test homepage_counters resource (should only return counter content)
                const countersResult = await dataProvider.getList('homepage_counters', {});
                console.log('Homepage counters result:', countersResult);
                setCountersData(countersResult.data);

            } catch (err) {
                console.error('Error testing filtering:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        testFiltering();
    }, []);

    if (loading) {
        return <div style={{padding: '20px'}}>Testing admin filtering...</div>;
    }

    if (error) {
        return <div style={{padding: '20px', color: 'red'}}>Error: {error}</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Admin Filtering Test</h2>
            
            <div style={{ marginBottom: '30px' }}>
                <h3>Homepage Hero Resource ({homepageData.length} items)</h3>
                <p><strong>Should show:</strong> Only hero banner content</p>
                <pre style={{background: '#f0f8ff', padding: '10px'}}>
                    {JSON.stringify(homepageData, null, 2)}
                </pre>
            </div>
            
            <div>
                <h3>Homepage Counters Resource ({countersData.length} items)</h3>
                <p><strong>Should show:</strong> Only counter statistics</p>
                <pre style={{background: '#f0fff0', padding: '10px'}}>
                    {JSON.stringify(countersData, null, 2)}
                </pre>
            </div>
        </div>
    );
};

export default TestAdminFiltering;