import React, { useState, useEffect } from 'react';
import dataProvider from './admin/dataProvider';

const TestDataProvider = () => {
    const [homepageData, setHomepageData] = useState([]);
    const [countersData, setCountersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('Testing dataProvider...');
                
                // Test homepage list
                const homepageResult = await dataProvider.getList('homepage', {});
                console.log('DataProvider homepage result:', homepageResult);
                setHomepageData(homepageResult.data);

                // Test counters list
                const countersResult = await dataProvider.getList('counters', {});
                console.log('DataProvider counters result:', countersResult);
                setCountersData(countersResult.data);

            } catch (err) {
                console.error('Error with dataProvider:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return <div style={{padding: '20px'}}>Testing dataProvider...</div>;
    }

    if (error) {
        return <div style={{padding: '20px', color: 'red'}}>Error: {error}</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>DataProvider Test</h2>
            
            <div style={{ marginBottom: '30px' }}>
                <h3>Homepage Data ({homepageData.length} items)</h3>
                <pre>{JSON.stringify(homepageData, null, 2)}</pre>
            </div>
            
            <div>
                <h3>Counters Data ({countersData.length} items)</h3>
                <pre>{JSON.stringify(countersData, null, 2)}</pre>
            </div>
        </div>
    );
};

export default TestDataProvider;