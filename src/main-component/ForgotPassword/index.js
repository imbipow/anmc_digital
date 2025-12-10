import React, {useState} from 'react';
import Grid from "@mui/material/Grid";
import SimpleReactValidator from "simple-react-validator";
import {toast} from "react-toastify";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import {Link, useNavigate} from "react-router-dom";
import cognitoAuthService from '../../services/cognitoAuth';

import './style.scss';

const ForgotPassword = (props) => {

    const push = useNavigate();

    const [step, setStep] = useState(1); // 1: Request code, 2: Confirm new password
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');

    const [value, setValue] = useState({
        email: '',
        verificationCode: '',
        newPassword: '',
        confirmPassword: ''
    });

    const changeHandler = (e) => {
        setValue({...value, [e.target.name]: e.target.value});
        validator.showMessages();
    };

    const [validator] = React.useState(new SimpleReactValidator({
        className: 'errorMessage'
    }));

    // Step 1: Request password reset code
    const submitEmailForm = async (e) => {
        e.preventDefault();

        if (!validator.fieldValid('email')) {
            validator.showMessages();
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);

        try {
            await cognitoAuthService.forgotPassword(value.email);
            setEmail(value.email);
            setStep(2);
            toast.success('Verification code sent to your email!');
        } catch (error) {
            console.error('Forgot password error:', error);
            if (error.code === 'UserNotFoundException') {
                toast.error('No account found with this email address');
            } else if (error.code === 'LimitExceededException') {
                toast.error('Too many attempts. Please try again later');
            } else if (error.code === 'UserInForceChangePasswordState') {
                toast.error('Your account requires initial password setup. Please check your email for your temporary password and use it to log in, then change your password.');
            } else if (error.code === 'InvalidParameterException') {
                toast.error('Unable to send password reset email. Please contact support if you need assistance.');
            } else {
                toast.error(error.message || 'Failed to send verification code');
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Confirm new password with verification code
    const submitResetForm = async (e) => {
        e.preventDefault();

        // Validate all fields
        if (!validator.fieldValid('verificationCode') ||
            !validator.fieldValid('newPassword') ||
            !validator.fieldValid('confirmPassword')) {
            validator.showMessages();
            toast.error('Please fill in all fields');
            return;
        }

        // Check if passwords match
        if (value.newPassword !== value.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        // Validate password strength
        if (value.newPassword.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);

        try {
            await cognitoAuthService.confirmPassword(
                email,
                value.verificationCode,
                value.newPassword
            );

            toast.success('Password reset successfully! Please login with your new password.');
            setValue({
                email: '',
                verificationCode: '',
                newPassword: '',
                confirmPassword: ''
            });
            validator.hideMessages();
            push('/login');
        } catch (error) {
            console.error('Confirm password error:', error);
            if (error.code === 'CodeMismatchException') {
                toast.error('Invalid verification code');
            } else if (error.code === 'ExpiredCodeException') {
                toast.error('Verification code has expired. Please request a new one');
                setStep(1);
            } else if (error.code === 'InvalidPasswordException') {
                toast.error('Password does not meet requirements');
            } else {
                toast.error(error.message || 'Failed to reset password');
            }
        } finally {
            setLoading(false);
        }
    };

    const resendCode = async () => {
        setLoading(true);
        try {
            await cognitoAuthService.forgotPassword(email);
            toast.success('Verification code resent to your email!');
        } catch (error) {
            toast.error('Failed to resend code. Please try again');
        } finally {
            setLoading(false);
        }
    };
    return (
        <Grid className="loginWrapper">
            <Grid className="loginForm">
                <h2>Forgot Password</h2>
                <p>{step === 1 ? 'Enter your email to receive a verification code' : 'Enter the verification code and your new password'}</p>

                {step === 1 ? (
                    // Step 1: Request verification code
                    <form onSubmit={submitEmailForm}>
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
                                    disabled={loading}
                                />
                                {validator.message('email', value.email, 'required|email')}
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
                                                Sending...
                                            </>
                                        ) : 'Send Verification Code'}
                                    </Button>
                                </Grid>
                                <p className="noteHelp">
                                    Remember your password? <Link to="/login">Return to Sign In</Link>
                                </p>
                            </Grid>
                        </Grid>
                    </form>
                ) : (
                    // Step 2: Confirm new password
                    <form onSubmit={submitResetForm}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                                    A verification code has been sent to <strong>{email}</strong>
                                </p>
                                <TextField
                                    className="inputOutline"
                                    fullWidth
                                    placeholder="Verification Code"
                                    value={value.verificationCode}
                                    variant="outlined"
                                    name="verificationCode"
                                    label="Verification Code"
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    onBlur={(e) => changeHandler(e)}
                                    onChange={(e) => changeHandler(e)}
                                    disabled={loading}
                                />
                                {validator.message('verificationCode', value.verificationCode, 'required')}
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
                                    placeholder="Confirm Password"
                                    value={value.confirmPassword}
                                    variant="outlined"
                                    name="confirmPassword"
                                    label="Confirm Password"
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
                                                Resetting...
                                            </>
                                        ) : 'Reset Password'}
                                    </Button>
                                </Grid>
                                <p className="noteHelp" style={{ marginTop: '15px' }}>
                                    Didn't receive the code?{' '}
                                    <Button
                                        onClick={resendCode}
                                        disabled={loading}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#1e3c72',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            padding: 0,
                                            fontSize: 'inherit'
                                        }}
                                    >
                                        Resend Code
                                    </Button>
                                </p>
                                <p className="noteHelp">
                                    <Button
                                        onClick={() => setStep(1)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#1e3c72',
                                            textDecoration: 'underline',
                                            cursor: 'pointer',
                                            padding: 0,
                                            fontSize: 'inherit'
                                        }}
                                    >
                                        Change email address
                                    </Button>
                                    {' | '}
                                    <Link to="/login">Return to Sign In</Link>
                                </p>
                            </Grid>
                        </Grid>
                    </form>
                )}

                <div className="shape-img">
                    <i className="fi flaticon-honeycomb"></i>
                </div>
            </Grid>
        </Grid>
    )
};

export default ForgotPassword;