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
    Button
} from 'react-admin';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Block as SuspendIcon,
    PlayArrow as ReactivateIcon
} from '@mui/icons-material';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField as MuiTextField,
    Button as MuiButton,
    Box
} from '@mui/material';
import cognitoAuthService from '../../services/cognitoAuth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

            <h3>Member Status</h3>
            <ChipField source="status" />
            <DateField source="approvedAt" label="Approved Date" showTime />
            <TextField source="approvedBy" label="Approved By" />
            <DateField source="rejectedAt" label="Rejected Date" showTime />
            <TextField source="rejectedBy" label="Rejected By" />
            <TextField source="rejectionReason" label="Rejection Reason" />
            <DateField source="suspendedAt" label="Suspended Date" showTime />
            <TextField source="suspendedBy" label="Suspended By" />
            <TextField source="suspensionReason" label="Suspension Reason" />

            <h3>Actions</h3>
            <MemberActions />

            <h3>Address</h3>
            <TextField source="residentialAddress.street" label="Street" />
            <TextField source="residentialAddress.suburb" label="Suburb" />
            <TextField source="residentialAddress.state" label="State" />
            <TextField source="residentialAddress.postcode" label="Postcode" />
            <TextField source="residentialAddress.country" label="Country" />

            <h3>Family Members</h3>
            <ArrayField source="familyMembers">
                <Datagrid>
                    <TextField source="firstName" />
                    <TextField source="lastName" />
                    <TextField source="relationship" />
                    <TextField source="age" />
                </Datagrid>
            </ArrayField>

            <h3>Additional Information</h3>
            <RichTextField source="comments" />
            <TextField source="cognitoUserId" label="Cognito User ID" />
            <DateField source="createdAt" label="Registration Date" showTime />
            <DateField source="updatedAt" label="Last Updated" showTime />
        </SimpleShowLayout>
    </Show>
);
