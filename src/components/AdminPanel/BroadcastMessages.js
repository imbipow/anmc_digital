import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
    Box,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Typography,
    CircularProgress,
    Snackbar,
    Alert,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControlLabel,
    Switch
} from '@mui/material';
import {
    Send,
    Group,
    People,
    Email as EmailIcon
} from '@mui/icons-material';
import API_CONFIG from '../../config/api';
import cognitoAuthService from '../../services/cognitoAuth';

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

const BroadcastMessages = () => {
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        recipients: 'all',
        isHtml: true
    });
    const [sending, setSending] = useState(false);
    const [stats, setStats] = useState({
        members: 0,
        lifeMembers: 0,
        subscribers: 0,
        total: 0
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch all members and count by type
            const memberResponse = await authenticatedFetch(API_CONFIG.getURL(API_CONFIG.endpoints.members));
            const members = await memberResponse.json();

            // Count members by type
            let generalCount = 0;
            let lifeCount = 0;

            if (Array.isArray(members)) {
                members.forEach(member => {
                    if (member.membershipType === 'life') {
                        lifeCount++;
                    } else {
                        generalCount++;
                    }
                });
            }

            // Fetch subscriber stats
            const subscriberResponse = await authenticatedFetch(API_CONFIG.getURL(API_CONFIG.endpoints.subscriberStats));
            const subscriberData = await subscriberResponse.json();

            const subscriberCount = subscriberData.active || subscriberData.total || 0;

            setStats({
                members: generalCount,
                lifeMembers: lifeCount,
                subscribers: subscriberCount,
                total: generalCount + lifeCount + subscriberCount
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats({
                members: 0,
                lifeMembers: 0,
                subscribers: 0,
                total: 0
            });
        }
    };

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        const newValue = e.target.type === 'checkbox' ? checked : value;
        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleMessageChange = (value) => {
        setFormData(prev => ({
            ...prev,
            message: value
        }));
    };

    const handleSendBroadcast = async (e) => {
        e.preventDefault();

        if (!formData.subject.trim() || !formData.message.trim()) {
            showSnackbar('Please fill in both subject and message', 'error');
            return;
        }

        if (!window.confirm(`Are you sure you want to send this message to ${getRecipientCount()} recipients?`)) {
            return;
        }

        setSending(true);

        try {
            const response = await authenticatedFetch(API_CONFIG.getURL(API_CONFIG.endpoints.messagesBroadcast), {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                showSnackbar(`Broadcast sent successfully to ${data.recipientCount} recipients!`, 'success');
                setFormData({
                    subject: '',
                    message: '',
                    recipients: 'all'
                });
            } else {
                showSnackbar(data.error || 'Failed to send broadcast', 'error');
            }
        } catch (error) {
            console.error('Error sending broadcast:', error);
            showSnackbar('Failed to send broadcast. Please try again.', 'error');
        } finally {
            setSending(false);
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const getRecipientCount = () => {
        switch (formData.recipients) {
            case 'all':
                return stats.total;
            case 'members':
                return stats.members + stats.lifeMembers;
            case 'life-members':
                return stats.lifeMembers;
            case 'subscribers':
                return stats.subscribers;
            default:
                return 0;
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Broadcast Messages
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
                Send email messages to members, subscribers, or all recipients
            </Typography>

            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h6">{stats.members}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    General Members
                                </Typography>
                            </Box>
                            <People color="primary" />
                        </Box>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h6">{stats.lifeMembers}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Life Members
                                </Typography>
                            </Box>
                            <Group color="secondary" />
                        </Box>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h6">{stats.subscribers}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Newsletter Subscribers
                                </Typography>
                            </Box>
                            <EmailIcon color="info" />
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ backgroundColor: '#f5f5f5' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="h6">{stats.total}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Total Recipients
                                </Typography>
                            </Box>
                            <People sx={{ fontSize: 40 }} color="action" />
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Broadcast Form */}
            <Paper sx={{ p: 3 }}>
                <form onSubmit={handleSendBroadcast}>
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Recipients</InputLabel>
                        <Select
                            name="recipients"
                            value={formData.recipients}
                            onChange={handleChange}
                            label="Recipients"
                            disabled={sending}
                        >
                            <MenuItem value="all">
                                All Recipients ({stats.total})
                            </MenuItem>
                            <MenuItem value="members">
                                All Members ({stats.members + stats.lifeMembers})
                            </MenuItem>
                            <MenuItem value="life-members">
                                Life Members Only ({stats.lifeMembers})
                            </MenuItem>
                            <MenuItem value="subscribers">
                                Newsletter Subscribers Only ({stats.subscribers})
                            </MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        disabled={sending}
                        sx={{ mb: 3 }}
                        placeholder="Enter email subject"
                    />

                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                                Message *
                            </Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isHtml}
                                        onChange={handleChange}
                                        name="isHtml"
                                        disabled={sending}
                                    />
                                }
                                label="HTML Email"
                            />
                        </Box>
                        {formData.isHtml ? (
                            <Box sx={{
                                '& .quill': {
                                    backgroundColor: 'white',
                                    borderRadius: '4px'
                                },
                                '& .ql-container': {
                                    minHeight: '300px',
                                    fontSize: '14px'
                                },
                                '& .ql-editor': {
                                    minHeight: '300px'
                                }
                            }}>
                                <ReactQuill
                                    theme="snow"
                                    value={formData.message}
                                    onChange={handleMessageChange}
                                    readOnly={sending}
                                    placeholder="Enter your message here..."
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, 3, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'color': [] }, { 'background': [] }],
                                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                            [{ 'align': [] }],
                                            ['link', 'image'],
                                            ['clean']
                                        ]
                                    }}
                                />
                            </Box>
                        ) : (
                            <TextField
                                fullWidth
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                disabled={sending}
                                multiline
                                rows={15}
                                placeholder="Enter your message here..."
                                variant="outlined"
                            />
                        )}
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                This message will be sent to <Chip label={getRecipientCount()} size="small" color="primary" /> recipients
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Note: Emails include an unsubscribe link automatically
                            </Typography>
                        </Box>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            disabled={sending || !formData.subject.trim() || !formData.message.trim()}
                            startIcon={sending ? <CircularProgress size={20} /> : <Send />}
                        >
                            {sending ? 'Sending...' : 'Send Broadcast'}
                        </Button>
                    </Box>
                </form>
            </Paper>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BroadcastMessages;
