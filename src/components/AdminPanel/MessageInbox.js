import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    Typography,
    CircularProgress,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    TextField
} from '@mui/material';
import {
    Email,
    MailOutline,
    Delete,
    Visibility,
    Refresh,
    Reply
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

const MessageInbox = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [replyDialogOpen, setReplyDialogOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [replying, setReplying] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [currentTab, setCurrentTab] = useState(0); // 0: all, 1: unread, 2: read

    useEffect(() => {
        fetchMessages();
    }, [currentTab]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await authenticatedFetch(API_CONFIG.getURL(API_CONFIG.endpoints.messages));
            const data = await response.json();

            // Filter by type (only contact messages, not broadcasts)
            let filteredMessages = data.filter(msg => msg.type === 'contact');

            // Apply tab filter
            if (currentTab === 1) {
                filteredMessages = filteredMessages.filter(msg => msg.status === 'unread');
            } else if (currentTab === 2) {
                filteredMessages = filteredMessages.filter(msg => msg.status === 'read');
            }

            setMessages(filteredMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error('Error fetching messages:', error);
            showSnackbar('Failed to load messages', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleViewMessage = async (message) => {
        setSelectedMessage(message);
        setViewDialogOpen(true);

        // Mark as read if unread
        if (message.status === 'unread') {
            try {
                const response = await authenticatedFetch(API_CONFIG.getURL(API_CONFIG.endpoints.messageMarkRead(message.id)), {
                    method: 'PATCH'
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Failed to mark message as read:', errorData);
                    showSnackbar('Failed to mark message as read', 'error');
                    return;
                }

                // Update local state immediately
                setMessages(prevMessages =>
                    prevMessages.map(msg =>
                        msg.id === message.id ? { ...msg, status: 'read', readAt: new Date().toISOString() } : msg
                    )
                );

                // Update selected message
                setSelectedMessage({ ...message, status: 'read', readAt: new Date().toISOString() });

                console.log('✅ Message marked as read:', message.id);
            } catch (error) {
                console.error('Error marking message as read:', error);
                showSnackbar('Error marking message as read', 'error');
            }
        }
    };

    const handleReply = (message) => {
        setSelectedMessage(message);
        setReplyMessage('');
        setViewDialogOpen(false);
        setReplyDialogOpen(true);
    };

    const handleSendReply = async () => {
        if (!replyMessage.trim()) {
            showSnackbar('Please enter a reply message', 'error');
            return;
        }

        setReplying(true);

        try {
            const response = await authenticatedFetch(API_CONFIG.getURL(API_CONFIG.endpoints.messagesBroadcast), {
                method: 'POST',
                body: JSON.stringify({
                    subject: `Re: ${selectedMessage.subject}`,
                    message: replyMessage,
                    recipients: 'custom',
                    customEmails: [selectedMessage.email]
                })
            });

            if (response.ok) {
                showSnackbar('Reply sent successfully!', 'success');
                setReplyDialogOpen(false);
                setReplyMessage('');
            } else {
                const data = await response.json();
                showSnackbar(data.error || 'Failed to send reply', 'error');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
            showSnackbar('Failed to send reply. Please try again.', 'error');
        } finally {
            setReplying(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) {
            return;
        }

        try {
            const response = await authenticatedFetch(API_CONFIG.getURL(`/messages/${messageId}`), {
                method: 'DELETE'
            });

            if (response.ok) {
                showSnackbar('Message deleted successfully', 'success');
                fetchMessages();
            } else {
                showSnackbar('Failed to delete message', 'error');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            showSnackbar('Failed to delete message', 'error');
        }
    };

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-AU', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Message Inbox</Typography>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={fetchMessages}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </Box>

            <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="All Messages" />
                <Tab label="Unread" />
                <Tab label="Read" />
            </Tabs>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : messages.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No messages found
                    </Typography>
                </Paper>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell width="50">Status</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Subject</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {messages.map((message) => (
                                <TableRow
                                    key={message.id}
                                    sx={{
                                        backgroundColor: message.status === 'unread' ? '#f5f5f5' : 'inherit',
                                        '&:hover': { backgroundColor: '#fafafa' }
                                    }}
                                >
                                    <TableCell>
                                        {message.status === 'unread' ? (
                                            <Email color="primary" />
                                        ) : (
                                            <MailOutline color="action" />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: message.status === 'unread' ? 'bold' : 'normal' }}
                                        >
                                            {message.name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{message.email}</TableCell>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            sx={{ fontWeight: message.status === 'unread' ? 'bold' : 'normal' }}
                                        >
                                            {message.subject}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{formatDate(message.createdAt)}</TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleViewMessage(message)}
                                            size="small"
                                        >
                                            <Visibility />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeleteMessage(message.id)}
                                            size="small"
                                        >
                                            <Delete />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* View Message Dialog */}
            <Dialog
                open={viewDialogOpen}
                onClose={() => {
                    setViewDialogOpen(false);
                    // Optionally refresh messages when dialog closes to ensure sync
                    // fetchMessages();
                }}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Message Details
                    {selectedMessage?.status === 'unread' && (
                        <Chip label="New" color="primary" size="small" sx={{ ml: 2 }} />
                    )}
                </DialogTitle>
                <DialogContent>
                    {selectedMessage && (
                        <Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">From:</Typography>
                                <Typography variant="body1">{selectedMessage.name}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Email:</Typography>
                                <Typography variant="body1">
                                    <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                                </Typography>
                            </Box>
                            {selectedMessage.phone && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Phone:</Typography>
                                    <Typography variant="body1">{selectedMessage.phone}</Typography>
                                </Box>
                            )}
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Subject:</Typography>
                                <Typography variant="body1">{selectedMessage.subject}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Date:</Typography>
                                <Typography variant="body1">{formatDate(selectedMessage.createdAt)}</Typography>
                            </Box>
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="subtitle2" color="text.secondary">Message:</Typography>
                                <Paper sx={{ p: 2, mt: 1, backgroundColor: '#f5f5f5' }}>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {selectedMessage.message}
                                    </Typography>
                                </Paper>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleReply(selectedMessage)}
                        startIcon={<Reply />}
                    >
                        Reply
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reply Dialog */}
            <Dialog
                open={replyDialogOpen}
                onClose={() => setReplyDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Reply to {selectedMessage?.name}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2, mt: 1 }}>
                        <Typography variant="subtitle2" color="text.secondary">To:</Typography>
                        <Typography variant="body1">{selectedMessage?.email}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Subject:</Typography>
                        <Typography variant="body1">Re: {selectedMessage?.subject}</Typography>
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        rows={8}
                        label="Your Reply"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        disabled={replying}
                        placeholder="Type your reply here..."
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setReplyDialogOpen(false)} disabled={replying}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSendReply}
                        disabled={replying}
                        startIcon={<Reply />}
                    >
                        {replying ? 'Sending...' : 'Send Reply'}
                    </Button>
                </DialogActions>
            </Dialog>

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

export default MessageInbox;
