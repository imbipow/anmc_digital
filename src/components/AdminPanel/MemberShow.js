import React, { useState, useEffect } from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    EmailField,
    DateField,
    NumberField,
    ChipField,
    ArrayField,
    Datagrid,
    RichTextField,
    useRecordContext,
    useRefresh,
    useNotify,
    Button,
    ShowButton
} from 'react-admin';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Block as SuspendIcon,
    PlayArrow as ReactivateIcon,
    Autorenew as RenewIcon,
    Print as PrintIcon,
    Download as DownloadIcon,
    Badge as BadgeIcon
} from '@mui/icons-material';
import {
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField as MuiTextField,
    Button as MuiButton
} from '@mui/material';
import cognitoAuthService from '../../services/cognitoAuth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Component to display direct debit bank account details for installment payments
const InstallmentBankDetails = () => {
    const record = useRecordContext();

    if (!record || record.paymentType !== 'installments') {
        return null;
    }

    return (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3cd', borderRadius: 1, border: '1px solid #ffc107' }}>
            <h3 style={{ marginTop: 0, color: '#856404' }}>Installment Payment Details</h3>

            {/* Payment Summary */}
            <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #ffc107' }}>
                <p style={{ margin: '8px 0', fontSize: '14px' }}>
                    <strong>Total Membership Fee:</strong> ${record.membershipFee || 0} AUD
                </p>
                {record.installmentAmount && (
                    <p style={{ margin: '8px 0', fontSize: '14px' }}>
                        <strong>Upfront Payment (Paid):</strong> ${record.installmentAmount} AUD
                    </p>
                )}
                {record.remainingBalance && (
                    <p style={{ margin: '8px 0', fontSize: '14px' }}>
                        <strong>Remaining Balance:</strong> ${record.remainingBalance} AUD
                    </p>
                )}
            </div>

            {/* Direct Debit Details */}
            <h4 style={{ marginTop: '12px', marginBottom: '8px', color: '#856404', fontSize: '15px' }}>
                Direct Debit Account (Member's Bank Account)
            </h4>
            <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>Account Name:</strong> {record.directDebitAccountName || <em style={{ color: '#999' }}>Not provided</em>}
            </p>
            <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>BSB:</strong> {record.directDebitBsb || <em style={{ color: '#999' }}>Not provided</em>}
            </p>
            <p style={{ margin: '8px 0', fontSize: '14px' }}>
                <strong>Account Number:</strong> {record.directDebitAccountNumber || <em style={{ color: '#999' }}>Not provided</em>}
            </p>
            {record.directDebitAuthorityAccepted && (
                <p style={{ margin: '8px 0', fontSize: '13px', color: '#28a745' }}>
                    ✓ Direct Debit Authority Accepted
                </p>
            )}
            <p style={{ margin: '12px 0 0 0', fontSize: '13px', color: '#856404', fontStyle: 'italic' }}>
                This bank account will be used for automatic installment debits.
            </p>
        </Box>
    );
};

const MemberActions = () => {
    const record = useRecordContext();
    const refresh = useRefresh();
    const notify = useNotify();
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [suspensionReason, setSuspensionReason] = useState('');
    const [approvePassword, setApprovePassword] = useState('');
    const [requiresPassword, setRequiresPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const getUserRole = async () => {
            try {
                const user = await cognitoAuthService.getCurrentUser();
                const groups = user.groups || [];

                if (groups.includes('AnmcAdmins')) {
                    setUserRole('admin');
                } else if (groups.includes('AnmcManagers')) {
                    setUserRole('manager');
                }
            } catch (error) {
                console.error('Error getting user role:', error);
                setUserRole('manager'); // Default to manager (more restrictive)
            }
        };

        getUserRole();
    }, []);

    if (!record) return null;

    const isAdmin = userRole === 'admin';

    const handleApprove = async (password = null) => {
        setLoading(true);
        try {
            const requestBody = {
                approvedBy: 'admin' // TODO: Get from current admin user
            };

            if (password) {
                requestBody.password = password;
            }

            // Get JWT token for authentication
            const token = await cognitoAuthService.getIdToken();
            if (!token) {
                notify('Authentication required. Please log in again.', { type: 'error' });
                return;
            }

            const response = await fetch(`${API_BASE_URL}/members/${record.id}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                notify(data.message || 'Member approved successfully. User can now login.', { type: 'success' });
                setApproveDialogOpen(false);
                setApprovePassword('');
                setRequiresPassword(false);
                refresh();
            } else if (data.requiresPassword) {
                // Cognito user doesn't exist, need password
                setRequiresPassword(true);
                setApproveDialogOpen(true);
                notify(data.error, { type: 'warning' });
            } else {
                notify(data.error || data.message || 'Failed to approve member', { type: 'error' });
            }
        } catch (error) {
            notify('Error approving member: ' + error.message, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleApproveClick = () => {
        if (!window.confirm('Are you sure you want to approve this member? They will be able to login to the member portal.')) {
            return;
        }
        handleApprove();
    };

    const handleApproveWithPassword = () => {
        if (!approvePassword) {
            notify('Password is required', { type: 'error' });
            return;
        }
        handleApprove(approvePassword);
    };

    const handleReject = async () => {
        setLoading(true);
        try {
            // Get JWT token for authentication
            const token = await cognitoAuthService.getIdToken();
            if (!token) {
                notify('Authentication required. Please log in again.', { type: 'error' });
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/members/${record.id}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    reason: rejectionReason,
                    rejectedBy: 'admin' // TODO: Get from current admin user
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                notify('Member registration rejected.', { type: 'info' });
                setRejectDialogOpen(false);
                setRejectionReason('');
                refresh();
            } else {
                notify(data.message || 'Failed to reject member', { type: 'error' });
            }
        } catch (error) {
            notify('Error rejecting member: ' + error.message, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async () => {
        setLoading(true);
        try {
            // Get JWT token for authentication
            const token = await cognitoAuthService.getIdToken();
            if (!token) {
                notify('Authentication required. Please log in again.', { type: 'error' });
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/members/${record.id}/suspend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    reason: suspensionReason,
                    suspendedBy: 'admin' // TODO: Get from current admin user
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                notify('Member suspended successfully. User cannot login.', { type: 'warning' });
                setSuspendDialogOpen(false);
                setSuspensionReason('');
                refresh();
            } else {
                notify(data.message || 'Failed to suspend member', { type: 'error' });
            }
        } catch (error) {
            notify('Error suspending member: ' + error.message, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async () => {
        if (!window.confirm('Are you sure you want to reactivate this member? They will be able to login again.')) {
            return;
        }

        setLoading(true);
        try {
            // Get JWT token for authentication
            const token = await cognitoAuthService.getIdToken();
            if (!token) {
                notify('Authentication required. Please log in again.', { type: 'error' });
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/members/${record.id}/reactivate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    reactivatedBy: 'admin' // TODO: Get from current admin user
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                notify('Member reactivated successfully. User can now login.', { type: 'success' });
                refresh();
            } else {
                notify(data.message || 'Failed to reactivate member', { type: 'error' });
            }
        } catch (error) {
            notify('Error reactivating member: ' + error.message, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleRenew = async () => {
        if (!window.confirm(`Renew membership for ${record.firstName} ${record.lastName}? This will extend their membership by 1 year.`)) {
            return;
        }

        setLoading(true);
        try {
            const token = await cognitoAuthService.getIdToken();
            if (!token) {
                notify('Authentication required. Please log in again.', { type: 'error' });
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/members/${record.id}/renew`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    paymentStatus: 'succeeded' // Mark as paid after admin renewal
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const expiryDate = new Date(data.newExpiryDate).toLocaleDateString();
                notify(`Membership renewed successfully! New expiry date: ${expiryDate}`, { type: 'success' });
                refresh();
            } else {
                notify(data.error || 'Failed to renew membership', { type: 'error' });
            }
        } catch (error) {
            notify('Error renewing membership: ' + error.message, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadCertificate = async () => {
        setLoading(true);
        try {
            const token = await cognitoAuthService.getIdToken();
            if (!token) {
                notify('Authentication required. Please log in again.', { type: 'error' });
                setLoading(false);
                return;
            }

            // Download PDF certificate
            const response = await fetch(`${API_BASE_URL}/members/${record.id}/certificate`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate certificate');
            }

            // Get the PDF blob
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Sanitize filename by removing special characters
            const sanitizedName = `${record.firstName}_${record.lastName}`.replace(/[^a-zA-Z0-9_]/g, '_');
            link.download = `ANMC_Certificate_${sanitizedName}_${record.referenceNo || 'MEMBER'}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            notify('Certificate downloaded successfully!', { type: 'success' });
        } catch (error) {
            console.error('Error downloading certificate:', error);
            notify('Failed to download certificate: ' + error.message, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadMemberDetails = async () => {
        setLoading(true);
        try {
            const token = await cognitoAuthService.getIdToken();
            if (!token) {
                notify('Authentication required. Please log in again.', { type: 'error' });
                setLoading(false);
                return;
            }

            // Download PDF member details
            const response = await fetch(`${API_BASE_URL}/members/${record.id}/details-pdf`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate member details PDF');
            }

            // Get the PDF blob
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            // Sanitize filename by removing special characters
            const sanitizedName = `${record.firstName}_${record.lastName}`.replace(/[^a-zA-Z0-9_]/g, '_');
            link.download = `Member_Details_${sanitizedName}_${record.referenceNo || 'MEMBER'}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            notify('Member details PDF downloaded successfully!', { type: 'success' });
        } catch (error) {
            console.error('Error downloading member details:', error);
            notify('Failed to download member details: ' + error.message, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };


    const handleToggleBadgeStatus = async () => {
        setLoading(true);
        try {
            const token = await cognitoAuthService.getIdToken();
            if (!token) {
                notify('Authentication required. Please log in again.', { type: 'error' });
                setLoading(false);
                return;
            }

            const newStatus = record.badgeTaken === 'yes' ? 'no' : 'yes';

            // Use referenceNo for the PATCH request since our backend route supports it
            const response = await fetch(`${API_BASE_URL}/members/${record.referenceNo || record.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ badgeTaken: newStatus })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update badge status');
            }

            notify(`Badge status updated to ${newStatus === 'yes' ? 'Taken' : 'Not Taken'}`, { type: 'success' });
            refresh();
        } catch (error) {
            console.error('Error updating badge status:', error);
            notify('Failed to update badge status: ' + error.message, { type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {record.status === 'pending_approval' && (
                    <>
                        <MuiButton
                            variant="contained"
                            color="success"
                            startIcon={<ApproveIcon />}
                            onClick={handleApproveClick}
                            disabled={loading}
                        >
                            Approve Member
                        </MuiButton>
                        {/* Reject is admin-only */}
                        {isAdmin && (
                            <MuiButton
                                variant="outlined"
                                color="error"
                                startIcon={<RejectIcon />}
                                onClick={() => setRejectDialogOpen(true)}
                                disabled={loading}
                            >
                                Reject Member
                            </MuiButton>
                        )}
                    </>
                )}

                {/* Suspend/Reactivate are admin-only */}
                {isAdmin && record.status === 'active' && (
                    <MuiButton
                        variant="outlined"
                        color="warning"
                        startIcon={<SuspendIcon />}
                        onClick={() => setSuspendDialogOpen(true)}
                        disabled={loading}
                    >
                        Suspend Member
                    </MuiButton>
                )}

                {isAdmin && record.status === 'suspended' && (
                    <MuiButton
                        variant="contained"
                        color="primary"
                        startIcon={<ReactivateIcon />}
                        onClick={handleReactivate}
                        disabled={loading}
                    >
                        Reactivate Member
                    </MuiButton>
                )}

                {/* Renew membership button - only for general memberships */}
                {isAdmin && record.membershipCategory === 'general' && (record.status === 'active' || record.status === 'pending_approval') && (
                    <MuiButton
                        variant="contained"
                        color="info"
                        startIcon={<RenewIcon />}
                        onClick={handleRenew}
                        disabled={loading}
                    >
                        Renew Membership
                    </MuiButton>
                )}

                {/* Download Certificate button */}
                {(record.status === 'active' || record.status === 'pending_approval') && (
                    <MuiButton
                        variant="contained"
                        color="secondary"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownloadCertificate}
                        disabled={loading}
                    >
                        Download Certificate
                    </MuiButton>
                )}

                {/* Toggle Badge Status button - admin only, only show if badge not taken */}
                {isAdmin && record.badgeTaken !== 'yes' && (
                    <MuiButton
                        variant="contained"
                        color="warning"
                        startIcon={<BadgeIcon />}
                        onClick={handleToggleBadgeStatus}
                        disabled={loading}
                    >
                        Mark Badge Taken
                    </MuiButton>
                )}

                {/* Download Member Details PDF button */}
                <MuiButton
                    variant="outlined"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadMemberDetails}
                    disabled={loading}
                >
                    Download Member Details
                </MuiButton>
            </Box>

            {/* Reject Dialog */}
            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
                <DialogTitle>Reject Member Registration</DialogTitle>
                <DialogContent>
                    <MuiTextField
                        autoFocus
                        margin="dense"
                        label="Reason for Rejection"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Please provide a reason for rejecting this member registration..."
                    />
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setRejectDialogOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleReject} color="error" disabled={loading || !rejectionReason}>
                        Reject
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Suspend Dialog */}
            <Dialog open={suspendDialogOpen} onClose={() => setSuspendDialogOpen(false)}>
                <DialogTitle>Suspend Member</DialogTitle>
                <DialogContent>
                    <MuiTextField
                        autoFocus
                        margin="dense"
                        label="Reason for Suspension"
                        fullWidth
                        multiline
                        rows={4}
                        value={suspensionReason}
                        onChange={(e) => setSuspensionReason(e.target.value)}
                        placeholder="Please provide a reason for suspending this member..."
                    />
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setSuspendDialogOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleSuspend} color="warning" disabled={loading || !suspensionReason}>
                        Suspend
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Approve with Password Dialog */}
            <Dialog open={approveDialogOpen} onClose={() => {
                setApproveDialogOpen(false);
                setApprovePassword('');
                setRequiresPassword(false);
            }}>
                <DialogTitle>Create Cognito User Account</DialogTitle>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <p style={{ color: '#666' }}>
                            This member doesn't have a Cognito user account yet.
                            Please provide a password to create their login credentials.
                        </p>
                    </Box>
                    <MuiTextField
                        autoFocus
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        value={approvePassword}
                        onChange={(e) => setApprovePassword(e.target.value)}
                        placeholder="Enter a secure password"
                        helperText="Min 8 characters with uppercase, lowercase, number & special character"
                    />
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => {
                        setApproveDialogOpen(false);
                        setApprovePassword('');
                        setRequiresPassword(false);
                    }}>
                        Cancel
                    </MuiButton>
                    <MuiButton
                        onClick={handleApproveWithPassword}
                        color="success"
                        disabled={loading || !approvePassword}
                        variant="contained"
                    >
                        Create Account & Approve
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export const MemberShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <style>{`
                @media print {
                    /* Hide non-printable elements */
                    .no-print,
                    .RaAppBar-appBar,
                    .RaSidebar-root,
                    .RaLayout-appFrame aside,
                    header,
                    nav,
                    .MuiAppBar-root,
                    .MuiDrawer-root,
                    button,
                    .RaButton-button,
                    .RaTopToolbar-root,
                    .RaShowActions-root {
                        display: none !important;
                        visibility: hidden !important;
                    }

                    /* Reset page layout for printing */
                    @page {
                        size: A4;
                        margin: 1cm;
                    }

                    body,
                    html {
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                        height: auto !important;
                        width: 100% !important;
                        background: white !important;
                    }

                    /* Force all containers to be visible and flow naturally */
                    #root,
                    .RaLayout-root,
                    .RaLayout-appFrame,
                    .RaLayout-content,
                    .RaLayout-contentWithSidebar,
                    main,
                    .RaShow-main,
                    .RaShow-card,
                    .MuiPaper-root,
                    .RaSimpleShowLayout-root {
                        display: block !important;
                        position: relative !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        height: auto !important;
                        min-height: auto !important;
                        box-shadow: none !important;
                        background: white !important;
                        overflow: visible !important;
                        page-break-inside: auto !important;
                    }

                    /* Ensure content flows properly */
                    .RaSimpleShowLayout-root > * {
                        page-break-inside: avoid !important;
                    }

                    /* Headings */
                    h3 {
                        page-break-after: avoid !important;
                        page-break-inside: avoid !important;
                        margin-top: 15px !important;
                        margin-bottom: 8px !important;
                        font-size: 14pt !important;
                        font-weight: bold !important;
                        border-bottom: 1px solid #333 !important;
                        padding-bottom: 3px !important;
                        color: black !important;
                    }

                    /* Labels and fields */
                    .RaLabeled-root {
                        display: flex !important;
                        margin-bottom: 8px !important;
                        page-break-inside: avoid !important;
                    }

                    .RaLabeled-label {
                        font-weight: bold !important;
                        display: inline-block !important;
                        margin-right: 10px !important;
                        min-width: 150px !important;
                        color: black !important;
                    }

                    .RaLabeled-field {
                        display: inline-block !important;
                        color: black !important;
                    }

                    /* Text fields */
                    span,
                    div,
                    p {
                        color: black !important;
                    }

                    /* Tables */
                    table {
                        page-break-inside: auto !important;
                        width: 100% !important;
                        border-collapse: collapse !important;
                        margin: 10px 0 !important;
                    }

                    thead {
                        display: table-header-group !important;
                    }

                    tbody {
                        display: table-row-group !important;
                    }

                    tr {
                        page-break-inside: avoid !important;
                        page-break-after: auto !important;
                    }

                    th, td {
                        border: 1px solid #333 !important;
                        padding: 6px !important;
                        text-align: left !important;
                        color: black !important;
                    }

                    th {
                        background-color: #e0e0e0 !important;
                        font-weight: bold !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Chips */
                    .MuiChip-root {
                        display: inline-block !important;
                        border: 1px solid #666 !important;
                        padding: 2px 6px !important;
                        border-radius: 3px !important;
                        background: white !important;
                        color: black !important;
                    }

                    .MuiChip-label {
                        color: black !important;
                    }
                }
            `}</style>

            <Box className="no-print">
                <h3>Actions</h3>
                <MemberActions />
            </Box>

            <TextField source="id" />
            <TextField source="referenceNo" label="Reference Number" />

            <h3>Personal Information</h3>
            <TextField source="firstName" label="First Name" />
            <TextField source="lastName" label="Last Name" />
            <EmailField source="email" />
            <TextField source="mobile" />
            <TextField source="gender" />
            <TextField source="age" />

            <h3>Membership Details</h3>
            <ChipField source="membershipCategory" label="Category" />
            <ChipField source="membershipType" label="Type" />
            <NumberField
                source="membershipFee"
                label="Membership Fee"
                options={{ style: 'currency', currency: 'AUD' }}
            />
            <TextField source="paymentType" label="Payment Type" />
            <ChipField source="paymentStatus" label="Payment Status" />
            <TextField source="paymentIntentId" label="Stripe Payment ID" />
            <DateField source="paymentDate" label="Payment Date" showTime />
            <DateField source="membershipStartDate" label="Membership Start Date" showTime />
            <DateField source="expiryDate" label="Expiry Date" showTime />
            <TextField source="lastRenewalDate" label="Last Renewal Date" />
            <NumberField source="renewalCount" label="Renewals" />

            {/* BSB Account Details for Installment Payments */}
            <InstallmentBankDetails />

            <Box className="no-print">
                <h3>Member Status</h3>
                <ChipField source="status" />
                <ChipField source="badgeTaken" label="Badge Status" />
                <DateField source="approvedAt" label="Approved Date" showTime />
                <TextField source="approvedBy" label="Approved By" />
                <DateField source="rejectedAt" label="Rejected Date" showTime />
                <TextField source="rejectedBy" label="Rejected By" />
                <TextField source="rejectionReason" label="Rejection Reason" />
                <DateField source="suspendedAt" label="Suspended Date" showTime />
                <TextField source="suspendedBy" label="Suspended By" />
                <TextField source="suspensionReason" label="Suspension Reason" />
            </Box>

            <h3>Address</h3>
            <TextField source="residentialAddress.street" label="Street" />
            <TextField source="residentialAddress.suburb" label="Suburb" />
            <TextField source="residentialAddress.state" label="State" />
            <TextField source="residentialAddress.postcode" label="Postcode" />
            <TextField source="residentialAddress.country" label="Country" />

            <h3>Family Information</h3>
            <TextField source="isPrimaryMember" label="Is Primary Member" />
            <TextField source="linkedMemberReferenceNo" label="Linked To" />
            <TextField source="relationship" label="Relationship to Primary" />

            {/* Show linked family members if this is a primary member */}
            <ArrayField source="familyMembers" label="Linked Family Members">
                <Datagrid bulkActionButtons={false}>
                    <TextField source="referenceNo" label="Ref No" />
                    <TextField source="firstName" label="First Name" />
                    <TextField source="lastName" label="Last Name" />
                    <EmailField source="email" />
                    <TextField source="mobile" />
                    <TextField source="relationship" label="Relationship" />
                    <ChipField source="status" label="Status" />
                    <ShowButton />
                </Datagrid>
            </ArrayField>

            {/* Show primary member if this is a family member */}
            {/* Note: This will be handled via primaryMember field */}

            <Box className="no-print">
                <h3>Additional Information</h3>
                <RichTextField source="comments" />
                <TextField source="cognitoUserId" label="Cognito User ID" />
                <DateField source="createdAt" label="Registration Date" showTime />
                <DateField source="updatedAt" label="Last Updated" showTime />
            </Box>
        </SimpleShowLayout>
    </Show>
);
