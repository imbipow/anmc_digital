import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './style.scss';

const RegistrationSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const memberData = location.state?.member;

    return (
        <Grid className="registrationSuccessWrapper">
            <Grid className="registrationSuccessContent">
                <div className="success-icon">
                    <CheckCircleIcon style={{ fontSize: 100, color: '#4caf50' }} />
                </div>

                <h1>Registration Successful!</h1>

                <div className="success-message">
                    <h2>Thank you for joining ANMC</h2>
                    <p className="subtitle">Your membership application has been received</p>
                </div>

                <div className="info-box">
                    <h3>What happens next?</h3>
                    <ol className="next-steps">
                        <li>
                            <strong>Application Review</strong>
                            <p>Our team will review your membership application within 1-2 business days.</p>
                        </li>
                        <li>
                            <strong>Email Notification</strong>
                            <p>You will receive an email at <strong>{memberData?.email || 'your registered email'}</strong> once your application is approved.</p>
                        </li>
                        <li>
                            <strong>Account Access</strong>
                            <p>After approval, you can login to access the member portal and exclusive benefits.</p>
                        </li>
                    </ol>
                </div>

                {memberData?.referenceNo && (
                    <div className="reference-box">
                        <p className="reference-label">Your Reference Number:</p>
                        <p className="reference-number">{memberData.referenceNo}</p>
                        <p className="reference-note">Please save this for your records</p>
                    </div>
                )}

                <div className="membership-details">
                    <h3>Membership Details</h3>
                    <div className="details-grid">
                        {memberData?.membershipCategory && (
                            <div className="detail-item">
                                <span className="label">Category:</span>
                                <span className="value">{memberData.membershipCategory.charAt(0).toUpperCase() + memberData.membershipCategory.slice(1)}</span>
                            </div>
                        )}
                        {memberData?.membershipType && (
                            <div className="detail-item">
                                <span className="label">Type:</span>
                                <span className="value">{memberData.membershipType.charAt(0).toUpperCase() + memberData.membershipType.slice(1)}</span>
                            </div>
                        )}
                        {memberData?.membershipFee && (
                            <div className="detail-item">
                                <span className="label">Fee:</span>
                                <span className="value">${memberData.membershipFee} AUD</span>
                            </div>
                        )}
                        {memberData?.paymentStatus && (
                            <div className="detail-item">
                                <span className="label">Payment Status:</span>
                                <span className="value">{memberData.paymentStatus.charAt(0).toUpperCase() + memberData.paymentStatus.slice(1)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="important-note">
                    <p>
                        <strong>Important:</strong> Your account is currently pending approval.
                        You will not be able to login until an administrator reviews and approves your application.
                    </p>
                </div>

                <div className="action-buttons">
                    <Button
                        variant="contained"
                        className="cBtnTheme cBtnLarge"
                        onClick={() => navigate('/home')}
                    >
                        Return to Home
                    </Button>
                    <Button
                        variant="outlined"
                        className="cBtnLarge"
                        onClick={() => navigate('/contact')}
                        style={{ marginLeft: '15px' }}
                    >
                        Contact Us
                    </Button>
                </div>

                <div className="help-section">
                    <p className="help-text">
                        Need help? Email us at{' '}
                        <a href="mailto:info@anmcinc.org.au">info@anmcinc.org.au</a>
                        {' '}or call{' '}
                        <a href="tel:+61234567890">+61 2 3456 7890</a>
                    </p>
                </div>

                <div className="shape-img">
                    <i className="fi flaticon-honeycomb"></i>
                </div>
            </Grid>
        </Grid>
    );
};

export default RegistrationSuccess;
