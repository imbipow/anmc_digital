import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Block as BlockIcon,
    Delete as DeleteIcon,
    PlayArrow as EnableIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import cognitoAuthService from '../../services/cognitoAuth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function to make authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
    try {
        const token = await cognitoAuthService.getIdToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    } catch (error) {
        console.error('Auth fetch error:', error);
        throw error;
    }
};

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [admins, setAdmins] = useState([]);
    const [managers, setManagers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Dialog states
    const [addManagerDialog, setAddManagerDialog] = useState(false);
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        phoneNumber: ''
    });
    const [selectedUser, setSelectedUser] = useState(null);

    // Fetch users
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const [adminsRes, managersRes, usersRes] = await Promise.all([
                authenticatedFetch(`${API_BASE_URL}/users/groups/AnmcAdmins/users`),
                authenticatedFetch(`${API_BASE_URL}/users/groups/AnmcManagers/users`),
                authenticatedFetch(`${API_BASE_URL}/users/groups/AnmcUsers/users`)
            ]);

            const adminsData = await adminsRes.json();
            const managersData = await managersRes.json();
            const usersData = await usersRes.json();

            if (adminsData.success) {
                setAdmins(adminsData.users);
            }
            if (managersData.success) {
                setManagers(managersData.users);
            }
            if (usersData.success) {
                setUsers(usersData.users);
            }
        } catch (err) {
            setError('Failed to fetch users: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddManager = async () => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/users/managers`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('Manager created successfully');
                setAddManagerDialog(false);
                setFormData({ email: '', name: '', password: '', phoneNumber: '' });
                fetchUsers();
            } else {
                setError(data.error || 'Failed to create manager');
            }
        } catch (err) {
            setError('Error creating manager: ' + err.message);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/users/${user.username}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ enabled: !user.enabled })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess(`User ${!user.enabled ? 'enabled' : 'disabled'} successfully`);
                fetchUsers();
            } else {
                setError(data.error || 'Failed to update user status');
            }
        } catch (err) {
            setError('Error updating user status: ' + err.message);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;

        try {
            const response = await authenticatedFetch(`${API_BASE_URL}/users/${selectedUser.username}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess('User deleted successfully');
                setDeleteDialog(false);
                setSelectedUser(null);
                fetchUsers();
            } else {
                setError(data.error || 'Failed to delete user');
            }
        } catch (err) {
            setError('Error deleting user: ' + err.message);
        }
    };

    const renderUserTable = (users, isAdmin) => (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Name</strong></TableCell>
                        <TableCell><strong>Email</strong></TableCell>
                        <TableCell><strong>Phone</strong></TableCell>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell><strong>Created</strong></TableCell>
                        {!isAdmin && <TableCell><strong>Actions</strong></TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={isAdmin ? 5 : 6} align="center">
                                <Typography color="text.secondary">
                                    No users found
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((user) => (
                            <TableRow key={user.username}>
                                <TableCell>{user.name || 'N/A'}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.enabled ? 'Active' : 'Disabled'}
                                        color={user.enabled ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(user.created).toLocaleDateString()}
                                </TableCell>
                                {!isAdmin && (
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            color={user.enabled ? 'warning' : 'success'}
                                            onClick={() => handleToggleStatus(user)}
                                            title={user.enabled ? 'Disable' : 'Enable'}
                                        >
                                            {user.enabled ? <BlockIcon /> : <EnableIcon />}
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setDeleteDialog(true);
                                            }}
                                            title="Delete"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">User Management</Typography>
                {activeTab === 1 && (
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => setAddManagerDialog(true)}
                    >
                        Add Manager
                    </Button>
                )}
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                    {success}
                </Alert>
            )}

            <Paper sx={{ mb: 2 }}>
                <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
                    <Tab label={`Admins (${admins.length})`} />
                    <Tab label={`Managers (${managers.length})`} />
                    <Tab label={`Users (${users.length})`} />
                </Tabs>
            </Paper>

            {activeTab === 0 && renderUserTable(admins, true)}
            {activeTab === 1 && renderUserTable(managers, false)}
            {activeTab === 2 && renderUserTable(users, false)}

            {/* Add Manager Dialog */}
            <Dialog open={addManagerDialog} onClose={() => setAddManagerDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add New Manager</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Full Name *"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            label="Email *"
                            type="email"
                            fullWidth
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <TextField
                            label="Phone Number"
                            fullWidth
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            placeholder="+61400000000"
                        />
                        <TextField
                            label="Password *"
                            type="password"
                            fullWidth
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            helperText="Min 8 characters with uppercase, lowercase, number & special character"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAddManagerDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddManager}
                        disabled={!formData.email || !formData.name || !formData.password}
                    >
                        Create Manager
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
                <DialogTitle>Delete User</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete user <strong>{selectedUser?.email}</strong>?
                    </Typography>
                    <Typography color="error" sx={{ mt: 2 }}>
                        This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteUser}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagement;
