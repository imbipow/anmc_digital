import { fetchUtils } from 'react-admin';
import API_CONFIG from '../../config/api';
import cognitoAuthService from '../../services/cognitoAuth';

const httpClient = async (url, options = {}) => {
    // Add custom headers if needed
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    options.headers.set('Content-Type', 'application/json');

    // Add JWT token for authentication
    try {
        const token = await cognitoAuthService.getIdToken();
        if (token) {
            options.headers.set('Authorization', `Bearer ${token}`);
            console.log('🔑 Token added to request:', url.substring(url.lastIndexOf('/') + 1));
        } else {
            console.warn('⚠️ No token available for request:', url);
        }
    } catch (error) {
        console.error('❌ Failed to get authentication token for:', url, error.message);
        // If token retrieval fails, throw error to prevent unauthorized requests
        throw new Error('Authentication required. Please log in again.');
    }

    return fetchUtils.fetchJson(url, options);
};

// Map react-admin resource names to API endpoints
const resourceToEndpoint = {
    news: API_CONFIG.endpoints.news,
    events: API_CONFIG.endpoints.events,
    projects: API_CONFIG.endpoints.projects,
    homepage: API_CONFIG.endpoints.homepage,
    'hero-slides': '/hero-slides',
    counters: API_CONFIG.endpoints.counters,
    about_us: API_CONFIG.endpoints.aboutUs,
    contact: API_CONFIG.endpoints.contact,
    master_plan: API_CONFIG.endpoints.masterPlan,
    achievements: API_CONFIG.endpoints.achievements,
    project_achievements: API_CONFIG.endpoints.achievements,
    faqs: API_CONFIG.endpoints.faqs,
    donations: API_CONFIG.endpoints.donations,
    members: API_CONFIG.endpoints.members,
    payments: API_CONFIG.endpoints.members, // Use members endpoint
    users: '/users',
    services: API_CONFIG.endpoints.services,
    bookings: API_CONFIG.endpoints.bookings,
    'kalash-bookings': API_CONFIG.endpoints.kalashBookings,
    documents: '/documents',
    inbox: API_CONFIG.endpoints.messages,
    broadcast: API_CONFIG.endpoints.messages,
};

const dataProvider = {
    getList: async (resource, params) => {
        try {
            // Special handling for resources with custom UI
            if (resource === 'user-management' || resource === 'inbox' || resource === 'broadcast') {
                return { data: [], total: 0 };
            }

            const endpoint = resourceToEndpoint[resource] || `/${resource}`;
            let url = API_CONFIG.getURL(endpoint);

            // For members and bookings resources, use server-side pagination to avoid loading all records
            if (resource === 'members' || resource === 'payments' || resource === 'bookings') {
                const { page, perPage } = params.pagination;
                const { field, order } = params.sort;
                const { q, ...otherFilters } = params.filter;

                // Build query parameters for server-side pagination
                const queryParams = new URLSearchParams();
                queryParams.append('page', page);
                queryParams.append('limit', perPage);

                // Add search query to backend (server-side search)
                if (q) {
                    queryParams.append('q', q);
                }

                // Add filters
                Object.keys(otherFilters).forEach(key => {
                    if (otherFilters[key] !== undefined && otherFilters[key] !== '') {
                        queryParams.append(key, otherFilters[key]);
                    }
                });

                url = `${url}?${queryParams.toString()}`;

                const response = await httpClient(url);
                const result = response.json;

                // If paginated response, use it
                if (result.data && Array.isArray(result.data)) {
                    let data = result.data;

                    // Apply client-side sorting (server doesn't support sorting yet)
                    if (field) {
                        data.sort((a, b) => {
                            let aVal = a[field];
                            let bVal = b[field];

                            if (field.includes('.')) {
                                const keys = field.split('.');
                                aVal = keys.reduce((obj, key) => obj?.[key], a);
                                bVal = keys.reduce((obj, key) => obj?.[key], b);
                            }

                            // Date sorting
                            if (field === 'createdAt' || field === 'updatedAt' || field === 'joinDate' || field === 'expiryDate') {
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

                    return {
                        data: data,
                        total: result.total,
                    };
                }
            }

            // For other resources, use original client-side pagination
            const response = await httpClient(url);
            let data = response.json;

            // Ensure data is an array
            if (!Array.isArray(data)) {
                data = [data];
            }

            // Special handling for achievements - map year to id
            if (resource === 'achievements') {
                data = data.map(item => ({
                    ...item,
                    id: item.year || item.id
                }));
            }

            // Special handling for payments - show all members (they all have payment info)
            if (resource === 'payments') {
                // Don't filter out any members - show all of them
                // Members with 0 fee are family members covered by primary member
                data = data;
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
            // Special handling for user-management
            if (resource === 'user-management') {
                return { data: { id: 1 } };
            }

            const endpoint = resourceToEndpoint[resource] || `/${resource}`;

            // Special handling for singleton resources (About Us, Contact, Master Plan) - they don't use ID in the URL
            let url;
            if (resource === 'about_us' || resource === 'contact' || resource === 'master_plan') {
                // Singleton resources, fetch without ID
                url = API_CONFIG.getURL(endpoint);
            } else {
                url = `${API_CONFIG.getURL(endpoint)}/${params.id}`;
            }

            const response = await httpClient(url);

            // For singleton resources, ensure the response has an id field for react-admin
            let data = response.json;
            if (resource === 'about_us' || resource === 'contact') {
                if (!data.id) {
                    data.id = 'main';
                }
            } else if (resource === 'master_plan') {
                // Master plan uses its actual DynamoDB id
                if (!data.id) {
                    data.id = 'master-plan-2025-2030';
                }
            }

            // Special handling for achievements - map year to id
            if (resource === 'achievements' && data.year && !data.id) {
                data.id = data.year;
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

            // Special handling for achievements - use year as id
            const createdId = resource === 'achievements' && dataToSend.year
                ? dataToSend.year
                : response.json.id;

            return { data: { ...params.data, id: createdId } };
        } catch (error) {
            console.error('Error creating record:', error);
            throw error;
        }
    },

    update: async (resource, params) => {
        try {
            const endpoint = resourceToEndpoint[resource] || `/${resource}`;

            // Special handling for singleton resources (About Us, Contact, Master Plan) - they don't use ID in the URL
            let url;
            if (resource === 'about_us' || resource === 'contact' || resource === 'master_plan') {
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
            } else if (resource === 'about_us' || resource === 'contact') {
                // For singleton resources, keep the id field as it's needed by the API
                if (!dataToSend.id) {
                    dataToSend.id = params.id || 'main';
                }
            } else if (resource === 'master_plan') {
                // Master plan - remove id from updates (backend service handles it)
                delete dataToSend.id;
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
