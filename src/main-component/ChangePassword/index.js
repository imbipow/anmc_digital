import React, {useState, useEffect} from 'react';
import Grid from "@mui/material/Grid";
import SimpleReactValidator from "simple-react-validator";
import {toast} from "react-toastify";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import cognitoAuthService from '../../services/cognitoAuth';

import './style.scss';

const ChangePassword = (props) => {

    const push = useNavigate();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [isTemporaryPassword, setIsTemporaryPassword] = useState(false);

    // Get email from URL parameters
    const emailFromUrl = searchParams.get('email');
    const tempFlag = searchParams.get('temp');

    const [value, setValue] = useState({
        email: emailFromUrl || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (tempFlag === 'true') {
            setIsTemporaryPassword(true);
        }
    }, [tempFlag]);

    const changeHandler = (e) => {
        setValue({...value, [e.target.name]: e.target.value});
        validator.showMessages();
    };

    const [validator] = React.useState(new SimpleReactValidator({
        className: 'errorMessage'
    }));

    const submitForm = async (e) => {
        e.preventDefault();

        // Validate all fields
        if (!validator.fieldValid('email') ||
            !validator.fieldValid('currentPassword') ||
            !validator.fieldValid('newPassword') ||
            !validator.fieldValid('confirmPassword')) {
            validator.showMessages();
            toast.error('Please fill in all fields');
            return;
        }

        // Check if passwords match
        if (value.newPassword !== value.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        // Validate password strength
        if (value.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        // Check if new password is same as current
        if (value.currentPassword === value.newPassword) {
            toast.error('New password must be different from current password');
            return;
        }

        setLoading(true);

        try {
            // Use completeNewPasswordChallenge to handle temporary passwords
            const result = await cognitoAuthService.completeNewPasswordChallenge(
                value.email,
                value.currentPassword,
                value.newPassword
            );

            toast.success('Password changed successfully! Please login with your new password.');

            setValue({
                email: '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            validator.hideMessages();

            // Redirect to login
            setTimeout(() => {
                push('/login');
            }, 1500);
        } catch (error) {
            console.error('Change password error:', error);

            if (error.code === 'NotAuthorizedException') {
                toast.error('Current password is incorrect');
            } else if (error.code === 'InvalidPasswordException' || error.message?.includes('password')) {
                toast.error('Password does not meet requirements. Must have uppercase, lowercase, number, and special character (min 8 chars)');
            } else if (error.code === 'LimitExceededException') {
                toast.error('Too many attempts. Please try again later');
            } else if (error.code === 'UserNotFoundException') {
                toast.error('User not found. Please check your email address');
            } else {
                toast.error(error.message || 'Failed to change password');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid className="loginWrapper">
            <Grid className="loginForm">
                <h2>Change Password</h2>
                {isTemporaryPassword && (
                    <div style={{
                        backgroundColor: '#fff3cd',
                        border: '1px solid #ff9800',
                        borderRadius: '5px',
                        padding: '15px',
                        marginBottom: '20px'
                    }}>
                        <p style={{ margin: 0, fontWeight: 'bold', color: '#d32f2f' }}>
                            ⚠️ Password Change Required
                        </p>
                        <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
                            You are using a temporary password. You must change it to continue.
                        </p>
                    </div>
                )}
                <p>Enter your current temporary password and create a new secure password</p>

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
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onBlur={(e) => changeHandler(e)}
                                onChange={(e) => changeHandler(e)}
                                disabled={loading || !!emailFromUrl}
                            />
                            {validator.message('email', value.email, 'required|email')}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                className="inputOutline"
                                fullWidth
                                placeholder="Current/Temporary Password"
                                value={value.currentPassword}
                                variant="outlined"
                                name="currentPassword"
                                label="Current/Temporary Password"
                                type="password"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onBlur={(e) => changeHandler(e)}
                                onChange={(e) => changeHandler(e)}
                                disabled={loading}
                            />
                            {validator.message('currentPassword', value.currentPassword, 'required')}
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                className="inputOutline"
                                fullWidth
                                placeholder="New Password"
                                value={value.newPassword}
                                variant="outlined"
                                name="newPassword"
                                label="New Password"
                                type="password"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onBlur={(e) => changeHandler(e)}
                                onChange={(e) => changeHandler(e)}
                                disabled={loading}
                            />
                            {validator.message('newPassword', value.newPassword, 'required|min:8')}
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                Password must be at least 8 characters, with uppercase, lowercase, number, and special character
                            </p>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                className="inputOutline"
                                fullWidth
                                placeholder="Confirm New Password"
                                value={value.confirmPassword}
                                variant="outlined"
                                name="confirmPassword"
                                label="Confirm New Password"
                                type="password"
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                onBlur={(e) => changeHandler(e)}
                                onChange={(e) => changeHandler(e)}
                                disabled={loading}
                            />
                            {validator.message('confirmPassword', value.confirmPassword, 'required')}
                        </Grid>
                        <Grid item xs={12}>
                            <Grid className="formFooter">
                                <Button
                                    fullWidth
                                    className="cBtn cBtnLarge cBtnTheme"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <CircularProgress size={20} color="inherit" style={{ marginRight: '10px' }} />
                                            Changing Password...
                                        </>
                                    ) : 'Change Password'}
                                </Button>
                            </Grid>
                            <p className="noteHelp">
                                <Link to="/login">Back to Sign In</Link>
                            </p>
                        </Grid>
                    </Grid>
                </form>

                <div className="shape-img">
                    <i className="fi flaticon-honeycomb"></i>
                </div>
            </Grid>
        </Grid>
    )
};

export default ChangePassword;
