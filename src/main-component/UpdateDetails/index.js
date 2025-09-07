import React, { useState } from 'react';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import ANMCHeader from '../../components/ANMCHeader';
import './style.css';

const UpdateDetails = () => {
    const [memberData, setMemberData] = useState({
        firstName: "John",
        lastName: "Doe",
        email: "user@gmail.com",
        phone: "+91-9876543210",
        address: "123 Temple Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        emergencyContact: "+91-9876543211",
        emergencyContactName: "Jane Doe"
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (e) => {
        setMemberData({
            ...memberData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsEditing(false);
        toast.success('Details updated successfully!');
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

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
                                        {memberData.firstName[0]}{memberData.lastName[0]}
                                    </Avatar>
                                    <IconButton 
                                        className="photo-upload-btn"
                                        component="label"
                                        sx={{ 
                                            position: 'absolute', 
                                            bottom: 0, 
                                            right: 0,
                                            bgcolor: 'white',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        📷
                                        <input type="file" hidden accept="image/*" />
                                    </IconButton>
                                </Box>
                                <Typography variant="h6" component="h2" className="profile-name">
                                    {memberData.firstName} {memberData.lastName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Member ID: ANMC-2024-001
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Joined: January 2024
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
                                            <Button variant="outlined" onClick={handleCancel}>
                                                Cancel
                                            </Button>
                                            <Button 
                                                variant="contained" 
                                                onClick={handleSubmit}
                                                sx={{ ml: 2, backgroundColor: '#1e3c72', '&:hover': { backgroundColor: '#2a5298' } }}
                                            >
                                                Save Changes
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
                                                label="Phone"
                                                name="phone"
                                                value={memberData.phone}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                label="Address"
                                                name="address"
                                                value={memberData.address}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                                multiline
                                                rows={2}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="City"
                                                name="city"
                                                value={memberData.city}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="State"
                                                name="state"
                                                value={memberData.state}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <TextField
                                                fullWidth
                                                label="Pin Code"
                                                name="pincode"
                                                value={memberData.pincode}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Emergency Contact Name"
                                                name="emergencyContactName"
                                                value={memberData.emergencyContactName}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                                variant="outlined"
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Emergency Contact Phone"
                                                name="emergencyContact"
                                                value={memberData.emergencyContact}
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