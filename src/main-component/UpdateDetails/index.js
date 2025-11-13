import React, { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { useMemberAuth } from '../../components/MemberAuth';

import ANMCHeader from '../../components/ANMCHeader';
import cognitoAuthService from '../../services/cognitoAuth';
import './style.css';

const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to make authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
    try {
        const token = await cognitoAuthService.getIdToken();
        console.log('🔐 [UpdateDetails] Auth token:', token ? 'Token retrieved' : 'No token');
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('✅ [UpdateDetails] Auth header added:', url);
        } else {
            console.warn('⚠️ [UpdateDetails] No token for:', url);
        }
        return fetch(url, { ...options, headers });
    } catch (error) {
        console.error('❌ [UpdateDetails] Auth fetch error:', error);
        throw error;
    }
};

const UpdateDetails = () => {
    const { currentUser } = useMemberAuth();
    const [memberData, setMemberData] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchMemberData = async () => {
            if (!currentUser || !currentUser.email) {
                toast.error('User not authenticated');
                setLoading(false);
                return;
            }

            try {
                setLoading(false);

                console.log('👤 [UpdateDetails] Current user:', {
                    email: currentUser.email,
                    given_name: currentUser.given_name,
                    family_name: currentUser.family_name,
                    phone_number: currentUser.phone_number,
                    groups: currentUser.groups,
                    hasName: !!currentUser.name
                });

                // Check if user is AnmcUser (not a member)
                const isAnmcUser = currentUser.groups?.includes('AnmcUsers');
                const isAnmcMember = currentUser.groups?.includes('AnmcMembers');

                console.log('🔍 [UpdateDetails] User type check:', { isAnmcUser, isAnmcMember });

                if (isAnmcUser && !isAnmcMember) {
                    // AnmcUsers don't have member records - use Cognito data directly
                    const userData = {
                        firstName: currentUser.given_name || currentUser.name?.split(' ')[0] || '',
                        lastName: currentUser.family_name || currentUser.name?.split(' ').slice(1).join(' ') || '',
                        email: currentUser.email,
                        mobile: currentUser.phone_number || '',
                        residentialAddress: {
                            street: '',
                            suburb: '',
                            state: '',
                            postcode: '',
                            country: 'Australia'
                        },
                        isAnmcUser: true, // Flag to identify user type
                        referenceNo: 'N/A',
                        status: 'active',
                        membershipCategory: 'User'
                    };
                    console.log('✅ [UpdateDetails] Created AnmcUser data:', userData);
                    setMemberData(userData);
                    setOriginalData(userData);
                } else {
                    // AnmcMembers have member records in DynamoDB
                    const response = await authenticatedFetch(`${API_BASE_URL}/members?email=${currentUser.email}`);

                    if (!response.ok) {
                        throw new Error('Failed to fetch member data');
                    }

                    const members = await response.json();

                    if (members && members.length > 0) {
                        const member = members[0];
                        setMemberData(member);
                        setOriginalData(member);
                    } else {
                        toast.error('Member profile not found');
                    }
                }
            } catch (error) {
                console.error('Error fetching member data:', error);
                toast.error('Failed to load member data');
            } finally {
                setLoading(false);
            }
        };

        fetchMemberData();
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Handle nested properties for address
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setMemberData({
                ...memberData,
                [parent]: {
                    ...memberData[parent],
                    [child]: value
                }
            });
        } else {
            setMemberData({
                ...memberData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!memberData) {
            toast.error('User data not loaded');
            return;
        }

        try {
            setSaving(true);

            if (memberData.isAnmcUser) {
                // AnmcUsers: Update Cognito attributes directly
                const updateData = {
                    firstName: memberData.firstName,
                    lastName: memberData.lastName,
                    email: memberData.email,
                    mobile: memberData.mobile
                };

                const response = await authenticatedFetch(`${API_BASE_URL}/users/${currentUser.email}/attributes`, {
                    method: 'PATCH',
                    body: JSON.stringify(updateData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details || errorData.error || 'Failed to update user details');
                }

                // Update local state
                setMemberData(memberData);
                setOriginalData(memberData);
                setIsEditing(false);
                toast.success('Details updated successfully!');
            } else {
                // AnmcMembers: Update member record in DynamoDB (which also updates Cognito)
                if (!memberData.id) {
                    toast.error('Member data not loaded');
                    return;
                }

                const updateData = {
                    firstName: memberData.firstName,
                    lastName: memberData.lastName,
                    email: memberData.email,
                    mobile: memberData.mobile,
                    residentialAddress: memberData.residentialAddress
                };

                const response = await authenticatedFetch(`${API_BASE_URL}/members/${memberData.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(updateData)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details || errorData.error || 'Failed to update member details');
                }

                const updatedMember = await response.json();
                setMemberData(updatedMember);
                setOriginalData(updatedMember);
                setIsEditing(false);

                // Check if email verification is required
                if (updatedMember.emailVerificationRequired) {
                    toast.success('Details updated successfully! Please check your new email for verification.', {
                        autoClose: 8000
                    });
                } else {
                    toast.success('Details updated successfully!');
                }
            }
        } catch (error) {
            console.error('Error updating user details:', error);
            toast.error(error.message || 'Failed to update details. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setMemberData(originalData);
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="update-details-wrapper">
                <ANMCHeader />
                <div className="container">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress size={60} />
                    </Box>
                </div>
            </div>
        );
    }

    if (!memberData) {
        return (
            <div className="update-details-wrapper">
                <ANMCHeader />
                <div className="container">
                    <Box textAlign="center" mt={5}>
                        <Typography variant="h5" color="error">
                            Member profile not found
                        </Typography>
                        <Button
                            component={Link}
                            to="/member-portal"
                            variant="contained"
                            sx={{ mt: 3 }}
                        >
                            Back to Portal
                        </Button>
                    </Box>
                </div>
            </div>
        );
    }

    return (
        <div className="update-details-wrapper">
            <ANMCHeader />

            <div className="container">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box className="page-header">
                            <Button
                                component={Link}
                                to="/member-portal"
                                className="back-button"
                                sx={{
                                    backgroundColor: '#1e3c72',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#2a5298'
                                    }
                                }}
                            >
                                ← Back to Portal
                            </Button>
                            <Typography variant="h4" component="h1">
                                👤 Update Details
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Modify your contact information and personal details
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card className="profile-card">
                            <CardContent className="profile-content">
                                <Box className="profile-avatar">
                                    <Avatar
                                        sx={{ width: 120, height: 120, bgcolor: '#1e3c72', fontSize: '3rem' }}
                                    >
                                        {memberData.firstName?.[0]?.toUpperCase()}{memberData.lastName?.[0]?.toUpperCase()}
                                    </Avatar>
                                </Box>
                                <Typography variant="h6" component="h2" className="profile-name">
                                    {memberData.firstName} {memberData.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Reference: {memberData.referenceNo || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Status: {memberData.status || 'N/A'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Category: {memberData.membershipCategory || 'N/A'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Card className="details-card">
                            <CardContent>
                                <Box className="card-header">
                                    <Typography variant="h6" component="h2">
                                        Personal Information
                                    </Typography>
                                    {!isEditing ? (
                                        <Button 
                                            variant="contained" 
                                            onClick={handleEdit}
                                            sx={{ backgroundColor: '#1e3c72', '&:hover': { backgroundColor: '#2a5298' } }}
                                        >
                                            Edit Details
                                        </Button>
                                    ) : (
                                        <Box className="edit-buttons">
                                            <Button variant="outlined" onClick={handleCancel} disabled={saving}>
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={handleSubmit}
                                                disabled={saving}
                                                sx={{ ml: 2, backgroundColor: '#1e3c72', '&:hover': { backgroundColor: '#2a5298' } }}
                                            >
                                                {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                                            </Button>
                                        </Box>
                                    )}
                                </Box>

                                <form onSubmit={handleSubmit}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="First Name"
                                                name="firstName"
                                                value={memberData.firstName}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Last Name"
                                                name="lastName"
                                                value={memberData.lastName}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Email"
                                                name="email"
                                                type="email"
                                                value={memberData.email}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Mobile"
                                                name="mobile"
                                                value={memberData.mobile || ''}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Street Address"
                                                name="residentialAddress.street"
                                                value={memberData.residentialAddress?.street || ''}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Suburb"
                                                name="residentialAddress.suburb"
                                                value={memberData.residentialAddress?.suburb || ''}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="State"
                                                name="residentialAddress.state"
                                                value={memberData.residentialAddress?.state || ''}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Postcode"
                                                name="residentialAddress.postcode"
                                                value={memberData.residentialAddress?.postcode || ''}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Country"
                                                name="residentialAddress.country"
                                                value={memberData.residentialAddress?.country || ''}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                    </Grid>
                                </form>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default UpdateDetails;