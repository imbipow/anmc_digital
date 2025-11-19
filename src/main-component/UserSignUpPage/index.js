import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import Checkbox from "@mui/material/Checkbox";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import API_CONFIG from '../../config/api';
import { getPhoneValidationError } from '../../utils/phoneValidation';
import '../SignUpPage/style.scss';

const UserSignUpPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get return URL from navigation state
    const { returnUrl } = location.state || {};

    // Form state - simplified for regular users
    const [formData, setFormData] = useState({
        // Personal Information
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        gender: '',

        // Address (optional for users)
        residentialAddress: {
            street: '',
            suburb: '',
            state: '',
            postcode: '',
            country: 'Australia'
        },

        // Password
        password: '',
        confirmPassword: '',

        // Declaration
        acceptDeclaration: false,

        // Comments
        comments: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Personal Information
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';

        // Australian phone validation
        const phoneError = getPhoneValidationError(formData.mobile);
        if (phoneError) newErrors.mobile = phoneError;

        if (!formData.gender) newErrors.gender = 'Gender is required';

        // Password
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, number and special character';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Declaration
        if (!formData.acceptDeclaration) {
            newErrors.acceptDeclaration = 'You must accept the declaration';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);

        try {
            // Register as a regular user (AnmcUsers group)
            const userData = {
                ...formData,
                userType: 'user' // This indicates it's a regular user, not a member
            };

            const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.userRegister), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            toast.success('Registration successful! You can now login and book services.');

            // Navigate to login page with return URL
            setTimeout(() => {
                navigate('/login', {
                    state: {
                        from: 'registration',
                        message: 'Registration successful! Please login to continue.',
                        email: formData.email,
                        returnUrl: returnUrl || '/member-portal'
                    }
                });
            }, 1500);

        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid className="loginWrapper">
            <Grid className="loginForm membershipForm">
                <div className="form-header">
                    <IconButton
                        onClick={() => navigate(-1)}
                        className="back-button"
                        aria-label="Go back"
                    >
                        <ArrowBackIcon />
                    </IconButton>
                    <div className="header-text">
                        <h2>ANMC User Registration</h2>
                        <p>Create an account to book our services</p>
                        <p style={{ fontSize: '0.9em', color: '#666', marginTop: '8px' }}>
                            Not a member? That's okay! Register as a user to book services.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* Personal Information */}
                        <Grid item xs={12}>
                            <h3 className="section-title">Personal Information</h3>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="First Name *"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Last Name *"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email *"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Mobile *"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                error={!!errors.mobile}
                                helperText={errors.mobile}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <FormControl component="fieldset" error={!!errors.gender}>
                                <FormLabel component="legend">Gender *</FormLabel>
                                <RadioGroup
                                    row
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel value="male" control={<Radio />} label="Male" />
                                    <FormControlLabel value="female" control={<Radio />} label="Female" />
                                </RadioGroup>
                                {errors.gender && <span className="error-text">{errors.gender}</span>}
                            </FormControl>
                        </Grid>

                        {/* Address Information - Optional */}
                        <Grid item xs={12}>
                            <h3 className="section-title">Address (Optional)</h3>
                            <p style={{ fontSize: '0.9em', color: '#666', marginTop: '-8px' }}>
                                Providing your address helps us serve you better
                            </p>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Street Address"
                                name="residentialAddress.street"
                                value={formData.residentialAddress.street}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Suburb"
                                name="residentialAddress.suburb"
                                value={formData.residentialAddress.suburb}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="State"
                                name="residentialAddress.state"
                                value={formData.residentialAddress.state}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Postcode"
                                name="residentialAddress.postcode"
                                value={formData.residentialAddress.postcode}
                                onChange={handleChange}
                                variant="outlined"
                            />
                        </Grid>

                        {/* Password */}
                        <Grid item xs={12}>
                            <h3 className="section-title">Account Security</h3>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Password *"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password || 'Min 8 characters with uppercase, lowercase, number & special character'}
                                variant="outlined"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Confirm Password *"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword}
                                variant="outlined"
                            />
                        </Grid>

                        {/* Comments */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Comments (Optional)"
                                name="comments"
                                value={formData.comments}
                                onChange={handleChange}
                                variant="outlined"
                                multiline
                                rows={3}
                                placeholder="Any additional information..."
                            />
                        </Grid>

                        {/* Declaration */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={formData.acceptDeclaration}
                                        onChange={handleChange}
                                        name="acceptDeclaration"
                                    />
                                }
                                label={
                                    <span>
                                        I declare that the information provided is true and correct.
                                        I agree to abide by the ANMC terms and conditions. *
                                    </span>
                                }
                            />
                            {errors.acceptDeclaration &&
                                <div className="error-text">{errors.acceptDeclaration}</div>
                            }
                        </Grid>

                        {/* Submit Button */}
                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                className="cBtn cBtnLarge cBtnTheme"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Create Account'}
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <p className="noteHelp">
                                Already have an account? <Link to="/login">Sign In</Link>
                            </p>
                            <p className="noteHelp">
                                Want to become a member? <Link to="/signup">Join as Member</Link>
                            </p>
                        </Grid>
                    </Grid>
                </form>

                <div className="shape-img">
                    <i className="fi flaticon-honeycomb"></i>
                </div>
            </Grid>
        </Grid>
    );
};

export default UserSignUpPage;
