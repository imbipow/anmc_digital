import React, { useState } from 'react';
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useMemberAuth } from '../../components/MemberAuth';
import './style.scss';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useMemberAuth();

    // Get state from navigation (if coming from booking flow)
    const { from, message, returnUrl } = location.state || {};

    const [value, setValue] = useState({
        email: '',
        password: '',
        remember: false,
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const changeHandler = (e) => {
        setValue({ ...value, [e.target.name]: e.target.value });
        // Clear error when user starts typing
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const rememberHandler = () => {
        setValue({ ...value, remember: !value.remember });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!value.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!value.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitForm = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setLoading(true);

        try {
            const result = await login(value.email, value.password);

            if (result.success) {
                toast.success('Successfully logged in!');
                setTimeout(() => {
                    // Redirect to return URL if provided, otherwise to member portal
                    navigate(returnUrl || '/member-portal');
                }, 1000);
            } else {
                toast.error(result.error || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('An error occurred during login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid className="loginWrapper">
            <Grid className="loginForm">
                <h2>Sign In</h2>
                <p>{from === 'booking' ? 'Login or create an account to book services' : 'Sign in to access your portal'}</p>

                {/* Show alert if coming from booking flow */}
                {from === 'booking' && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        {message || 'Please login or sign up to continue booking'}
                    </Alert>
                )}

                <form onSubmit={submitForm}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                className="inputOutline"
                                fullWidth
                                placeholder="E-mail"
                                value={value.email}
                                variant="outlined"
                                name="email"
                                label="E-mail"
                                error={!!errors.email}
                                helperText={errors.email}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={changeHandler}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                className="inputOutline"
                                fullWidth
                                placeholder="Password"
                                value={value.password}
                                variant="outlined"
                                name="password"
                                type="password"
                                label="Password"
                                error={!!errors.password}
                                helperText={errors.password}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onChange={changeHandler}
                                disabled={loading}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Grid className="formAction">
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={value.remember}
                                            onChange={rememberHandler}
                                            disabled={loading}
                                        />
                                    }
                                    label="Remember Me"
                                />
                                <Link to="/forgot-password">Forgot Password?</Link>
                            </Grid>
                            <Grid className="formFooter">
                                <Button
                                    fullWidth
                                    className="cBtnTheme"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <CircularProgress size={20} style={{ marginRight: 10, color: '#fff' }} />
                                            Signing in...
                                        </>
                                    ) : (
                                        'Login'
                                    )}
                                </Button>
                            </Grid>

                            {/* Show different signup options based on context */}
                            {from === 'booking' ? (
                                <div className="noteHelp" style={{ marginTop: '15px' }}>
                                    <p style={{ marginBottom: '8px', fontWeight: '500', color: '#333' }}>
                                        Don't have an account?
                                    </p>
                                    <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                        <Link
                                            to="/user-signup"
                                            state={{ returnUrl }}
                                            style={{
                                                padding: '10px 15px',
                                                backgroundColor: '#2a5298',
                                                color: 'white',
                                                textDecoration: 'none',
                                                borderRadius: '5px',
                                                textAlign: 'center',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Sign up as User (Quick - Book Services Only)
                                        </Link>
                                        <Link
                                            to="/signup"
                                            style={{
                                                padding: '10px 15px',
                                                backgroundColor: '#1e3c72',
                                                color: 'white',
                                                textDecoration: 'none',
                                                borderRadius: '5px',
                                                textAlign: 'center',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Register for Full Membership
                                        </Link>
                                    </div>
                                    <p style={{ fontSize: '0.85em', color: '#666', marginTop: '10px', lineStyle: 'italic' }}>
                                        User accounts can book services immediately. Members get full access + 10% discount.
                                    </p>
                                </div>
                            ) : (
                                <p className="noteHelp">
                                    Don't have an account? <Link to="/user-signup">Register</Link>
                                </p>
                            )}

                            <p className="noteHelp" style={{ marginTop: '10px', fontSize: '0.85em', color: '#666' }}>
                                Both members and users can login here
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

export default LoginPage;
