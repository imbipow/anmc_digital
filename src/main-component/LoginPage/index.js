import React, { useState } from 'react';
import Grid from "@mui/material/Grid";
import { toast } from "react-toastify";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import { Link, useNavigate } from "react-router-dom";
import { useMemberAuth } from '../../components/MemberAuth';
import './style.scss';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useMemberAuth();

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
                toast.success('Successfully logged in! Redirecting to Member Portal...');
                setTimeout(() => {
                    navigate('/member-portal');
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
                <h2>Member Sign In</h2>
                <p>Sign in to access your member portal</p>

                {/* Test Credentials Info */}
                <div className="test-credentials-info">
                    <p><strong>Test Credentials:</strong></p>
                    <p>Email: <code>member@anmc.org.au</code></p>
                    <p>Password: <code>Member123!</code></p>
                </div>

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
                            <p className="noteHelp">
                                Don't have an account? <Link to="/sign-up">Register for membership</Link>
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
