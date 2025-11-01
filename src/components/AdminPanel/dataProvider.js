import { fetchUtils } from 'react-admin';
import API_CONFIG from '../../config/api';

const httpClient = (url, options = {}) => {
    // Add custom headers if needed
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    options.headers.set('Content-Type', 'application/json');
    return fetchUtils.fetchJson(url, options);
};

// Map react-admin resource names to API endpoints
const resourceToEndpoint = {
    news: API_CONFIG.endpoints.news,
    events: API_CONFIG.endpoints.events,
    projects: API_CONFIG.endpoints.projects,
    facilities: API_CONFIG.endpoints.facilities,
    homepage: API_CONFIG.endpoints.homepage,
    counters: API_CONFIG.endpoints.counters,
    about_us: API_CONFIG.endpoints.aboutUs,
    contact: API_CONFIG.endpoints.contact,
    master_plan: API_CONFIG.endpoints.masterPlan,
    project_achievements: API_CONFIG.endpoints.achievements,
    faqs: API_CONFIG.endpoints.faqs,
    donations: API_CONFIG.endpoints.donations,
    members: API_CONFIG.endpoints.members,
};

const dataProvider = {
    getList: async (resource, params) => {
        try {
            const endpoint = resourceToEndpoint[resource] || `/${resource}`;
            const url = API_CONFIG.getURL(endpoint);

            const response = await httpClient(url);
            let data = response.json;

            // Ensure data is an array
            if (!Array.isArray(data)) {
                data = [data];
            }

            const { page, perPage } = params.pagination;
            const { field, order } = params.sort;
            const { q, ...otherFilters } = params.filter;

            let filteredRecords = data;

            // Text search filter
            if (q) {
                filteredRecords = filteredRecords.filter(record =>
                    Object.values(record).some(value => {
                        if (typeof value === 'object' && value !== null) {
                            return Object.values(value).some(nestedValue =>
                                String(nestedValue).toLowerCase().includes(q.toLowerCase())
                            );
                        }
                        return String(value).toLowerCase().includes(q.toLowerCase());
                    })
                );
            }

            // Apply other filters
            Object.keys(otherFilters).forEach(key => {
                if (otherFilters[key] !== undefined && otherFilters[key] !== '') {
                    filteredRecords = filteredRecords.filter(record =>
                        record[key] === otherFilters[key]
                    );
                }
            });

            // Sorting
            if (field) {
                filteredRecords.sort((a, b) => {
                    let aVal = a[field];
                    let bVal = b[field];

                    if (field.includes('.')) {
                        const keys = field.split('.');
                        aVal = keys.reduce((obj, key) => obj?.[key], a);
                        bVal = keys.reduce((obj, key) => obj?.[key], b);
                    }

                    // Date sorting
                    if (field === 'date' || field === 'startDate' || field === 'endDate' || field === 'publishDate') {
                        const aDate = new Date(aVal);
                        const bDate = new Date(bVal);
                        return order === 'ASC' ? aDate - bDate : bDate - aDate;
                    }

                    // String sorting
                    if (typeof aVal === 'string') {
                        return order === 'ASC'
                            ? aVal.localeCompare(bVal)
                            : bVal.localeCompare(aVal);
                    }

                    // Number sorting
                    return order === 'ASC' ? aVal - bVal : bVal - aVal;
                });
            }

            // Pagination
            const startIndex = (page - 1) * perPage;
            const endIndex = startIndex + perPage;
            const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

            return {
                data: paginatedRecords,
                total: filteredRecords.length,
            };
        } catch (error) {
            console.error('Error fetching data:', error);
            return { data: [], total: 0 };
        }
    },

    getOne: async (resource, params) => {
        try {
            const endpoint = resourceToEndpoint[resource] || `/${resource}`;

            // Special handling for About Us - it doesn't use ID in the URL
            let url;
            if (resource === 'about_us') {
                // About Us is a singleton resource, fetch without ID
                url = API_CONFIG.getURL(endpoint);
            } else {
                url = `${API_CONFIG.getURL(endpoint)}/${params.id}`;
            }

            const response = await httpClient(url);

            // For About Us, ensure the response has an id field for react-admin
            let data = response.json;
            if (resource === 'about_us' && !data.id) {
                data.id = 'main';
            }

            return { data };
        } catch (error) {
            console.error('Error fetching record:', error);
            throw error;
        }
    },

    getMany: async (resource, params) => {
        try {
            // Fetch all and filter by IDs (could be optimized with batch endpoint)
            const endpoint = resourceToEndpoint[resource] || `/${resource}`;
            const url = API_CONFIG.getURL(endpoint);

            const response = await httpClient(url);
            let data = response.json;

            if (!Array.isArray(data)) {
                data = [data];
            }

            const filteredRecords = data.filter(record =>
                params.ids.includes(String(record.id))
            );

            return { data: filteredRecords };
        } catch (error) {
            console.error('Error fetching records:', error);
            return { data: [] };
        }
    },

    getManyReference: async (resource, params) => {
        return dataProvider.getList(resource, params);
    },

    create: async (resource, params) => {
        try {
            const endpoint = resourceToEndpoint[resource] || `/${resource}`;
            const url = API_CONFIG.getURL(endpoint);

            // Prepare data - convert featured boolean to string if needed
            const dataToSend = { ...params.data };
            if ('featured' in dataToSend && typeof dataToSend.featured === 'boolean') {
                dataToSend.featured = dataToSend.featured ? 'true' : 'false';
            }

            const response = await httpClient(url, {
                method: 'POST',
                body: JSON.stringify(dataToSend),
            });

            return { data: { ...params.data, id: response.json.id } };
        } catch (error) {
            console.error('Error creating record:', error);
            throw error;
        }
    },

    update: async (resource, params) => {
        try {
            const endpoint = resourceToEndpoint[resource] || `/${resource}`;

            // Special handling for About Us - it doesn't use ID in the URL
            let url;
            if (resource === 'about_us') {
                url = API_CONFIG.getURL(endpoint);
            } else {
                url = `${API_CONFIG.getURL(endpoint)}/${params.id}`;
            }

            // Prepare data - convert featured boolean to string if needed
            const dataToSend = { ...params.data };
            if ('featured' in dataToSend && typeof dataToSend.featured === 'boolean') {
                dataToSend.featured = dataToSend.featured ? 'true' : 'false';
            }

            // For homepage, ensure we're sending the complete record
            // including the id and component fields
            if (resource === 'homepage') {
                // Keep id and component in the data for homepage (uses PUT operation)
                if (!dataToSend.id) {
                    dataToSend.id = params.id;
                }
                if (!dataToSend.component) {
                    dataToSend.component = params.previousData?.component || 'hero';
                }
            } else if (resource === 'about_us') {
                // For About Us, keep the id field as it's needed by the API
                if (!dataToSend.id) {
                    dataToSend.id = params.id || 'main';
                }
            } else {
                // For all other resources, remove id from updates
                // id is a key attribute and cannot be updated in DynamoDB
                delete dataToSend.id;
            }

            // Resource-specific transformations
            if (resource === 'counters') {
                // Ensure count is a number
                if (dataToSend.count && typeof dataToSend.count === 'string') {
                    dataToSend.count = parseInt(dataToSend.count);
                }
            }

            const response = await httpClient(url, {
                method: 'PUT',
                body: JSON.stringify(dataToSend),
            });

            return { data: response.json };
        } catch (error) {
            console.error('Error updating record:', error);
            throw error;
        }
    },

    updateMany: async (resource, params) => {
        try {
            await Promise.all(
                params.ids.map(id =>
                    dataProvider.update(resource, {
                        id,
                        data: params.data,
                    })
                )
            );
            return { data: params.ids };
        } catch (error) {
            console.error('Error updating multiple records:', error);
            throw error;
        }
    },

    delete: async (resource, params) => {
        try {
            const endpoint = resourceToEndpoint[resource] || `/${resource}`;
            const url = `${API_CONFIG.getURL(endpoint)}/${params.id}`;

            await httpClient(url, {
                method: 'DELETE',
            });

            return { data: params.previousData || { id: params.id } };
        } catch (error) {
            console.error('Error deleting record:', error);
            throw error;
        }
    },

    deleteMany: async (resource, params) => {
        try {
            await Promise.all(
                params.ids.map(id => dataProvider.delete(resource, { id }))
            );
            return { data: params.ids };
        } catch (error) {
            console.error('Error deleting multiple records:', error);
            throw error;
        }
    },
};

export default dataProvider;
