import React, { useState, useEffect } from 'react';
import dataProvider from './admin/dataProvider';

const TestHomepageData = () => {
    const [homepageHeroList, setHomepageHeroList] = useState(null);
    const [homepageHeroItem, setHomepageHeroItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const testData = async () => {
            try {
                console.log('Testing homepage hero data...');
                
                // Test getList for homepage_hero
                const listResult = await dataProvider.getList('homepage_hero', {});
                console.log('Homepage hero list result:', listResult);
                setHomepageHeroList(listResult);

                // If we have items, test getOne with the first item's ID
                if (listResult.data && listResult.data.length > 0) {
                    const firstItemId = listResult.data[0].id;
                    console.log('Testing getOne with ID:', firstItemId);
                    
                    const oneResult = await dataProvider.getOne('homepage_hero', { id: firstItemId });
                    console.log('Homepage hero getOne result:', oneResult);
                    setHomepageHeroItem(oneResult);
                }

            } catch (err) {
                console.error('Error testing homepage data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        testData();
    }, []);

    if (loading) {
        return <div style={{padding: '20px'}}>Testing homepage data...</div>;
    }

    if (error) {
        return <div style={{padding: '20px', color: 'red'}}>Error: {error}</div>;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Homepage Hero Data Test</h2>
            
            <div style={{ marginBottom: '30px' }}>
                <h3>getList Result ({homepageHeroList?.data?.length || 0} items)</h3>
                <pre style={{background: '#f0f8ff', padding: '10px', fontSize: '12px'}}>
                    {JSON.stringify(homepageHeroList, null, 2)}
                </pre>
            </div>
            
            {homepageHeroItem && (
                <div>
                    <h3>getOne Result</h3>
                    <pre style={{background: '#f0fff0', padding: '10px', fontSize: '12px'}}>
                        {JSON.stringify(homepageHeroItem, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};

export default TestHomepageData;