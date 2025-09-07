import React, { useState, useEffect } from 'react';
import adminService from './services/adminService';

const TestAdminData = () => {
    const [homepageData, setHomepageData] = useState([]);
    const [countersData, setCountersData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                console.log('Loading admin data...');
                
                // Test homepage data
                const homepage = await adminService.getResource('homepage');
                console.log('Homepage data:', homepage);
                setHomepageData(homepage);

                // Test counters data
                const counters = await adminService.getResource('counters');
                console.log('Counters data:', counters);
                setCountersData(counters);

            } catch (err) {
                console.error('Error loading admin data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return <div style={{padding: '20px'}}>Loading admin data...</div>;
    }

    if (error) {
        return <div style={{padding: '20px', color: 'red'}}>Error: {error}</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Admin Data Test</h2>
            
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

export default TestAdminData;