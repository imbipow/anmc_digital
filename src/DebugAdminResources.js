import React, { useState } from 'react';
import dataProvider from './admin/dataProvider';

const DebugAdminResources = () => {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(false);

    const testResource = async (resourceName) => {
        setLoading(true);
        try {
            console.log(`Testing resource: ${resourceName}`);
            const result = await dataProvider.getList(resourceName, {});
            console.log(`Result for ${resourceName}:`, result);
            
            setResults(prev => ({
                ...prev,
                [resourceName]: {
                    success: true,
                    data: result.data,
                    total: result.total,
                    error: null
                }
            }));
        } catch (error) {
            console.error(`Error for ${resourceName}:`, error);
            setResults(prev => ({
                ...prev,
                [resourceName]: {
                    success: false,
                    data: [],
                    total: 0,
                    error: error.message
                }
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Admin Resources Debug</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => testResource('homepage')} disabled={loading}>
                    Test Homepage Resource
                </button>
                <button onClick={() => testResource('counters')} disabled={loading} style={{marginLeft: '10px'}}>
                    Test Counters Resource
                </button>
                <button onClick={() => testResource('news')} disabled={loading} style={{marginLeft: '10px'}}>
                    Test News Resource
                </button>
            </div>

            {loading && <div>Loading...</div>}
            
            {Object.entries(results).map(([resourceName, result]) => (
                <div key={resourceName} style={{ 
                    marginBottom: '30px', 
                    padding: '15px', 
                    border: '1px solid #ccc',
                    borderRadius: '5px'
                }}>
                    <h3>{resourceName} Resource</h3>
                    <p><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</p>
                    <p><strong>Total Items:</strong> {result.total}</p>
                    {result.error && <p style={{color: 'red'}}><strong>Error:</strong> {result.error}</p>}
                    <details>
                        <summary>Raw Data ({result.data.length} items)</summary>
                        <pre style={{background: '#f5f5f5', padding: '10px', overflow: 'auto'}}>
                            {JSON.stringify(result.data, null, 2)}
                        </pre>
                    </details>
                </div>
            ))}
        </div>
    );
};

export default DebugAdminResources;