import React, { useState, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    CircularProgress
} from '@mui/material';
import { Print as PrintIcon, Download as DownloadIcon } from '@mui/icons-material';
import cognitoAuthService from '../../services/cognitoAuth';
import './MembershipCertificate.scss';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const MembershipCertificate = ({ memberId, open, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [certificateData, setCertificateData] = useState(null);
    const certificateRef = useRef();

    React.useEffect(() => {
        if (open && memberId) {
            fetchCertificateData();
        }
    }, [open, memberId]);

    const fetchCertificateData = async () => {
        setLoading(true);
        try {
            // Get the auth token
            const token = await cognitoAuthService.getIdToken();

            if (!token) {
                alert('Authentication required. Please log in again.');
                setLoading(false);
                onClose();
                return;
            }

            const response = await fetch(`${API_BASE_URL}/certificates/member/${memberId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setCertificateData(data.certificate);
            } else {
                alert(data.error || 'Failed to load certificate data');
            }
        } catch (error) {
            console.error('Error fetching certificate:', error);
            alert('Error loading certificate: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading certificate...</Typography>
                </DialogContent>
            </Dialog>
        );
    }

    if (!certificateData) {
        return null;
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Membership Certificate
                <Typography variant="caption" display="block">
                    Reference: {certificateData.referenceNo}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <Box className="certificate-container" ref={certificateRef} sx={{
                    p: 4,
                    border: '10px double #1976d2',
                    borderRadius: 2,
                    backgroundColor: '#fefefe',
                    minHeight: '600px',
                    position: 'relative'
                }}>
                    {/* Certificate Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h3" sx={{
                            fontFamily: 'Georgia, serif',
                            color: '#1976d2',
                            fontWeight: 'bold',
                            mb: 1
                        }}>
                            ANMC
                        </Typography>
                        <Typography variant="h6" sx={{
                            fontFamily: 'Georgia, serif',
                            color: '#666',
                            letterSpacing: 2
                        }}>
                            MEMBERSHIP CERTIFICATE
                        </Typography>
                        <Divider sx={{ my: 2, borderColor: '#1976d2', borderWidth: 2 }} />
                    </Box>

                    {/* Certificate Body */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="body1" sx={{ mb: 2, fontFamily: 'Georgia, serif' }}>
                            This is to certify that
                        </Typography>

                        <Typography variant="h4" sx={{
                            fontFamily: 'Brush Script MT, cursive',
                            color: '#1976d2',
                            my: 3,
                            fontWeight: 'bold'
                        }}>
                            {certificateData.memberName}
                        </Typography>

                        <Typography variant="body1" sx={{ mb: 2, fontFamily: 'Georgia, serif' }}>
                            has been registered as a
                        </Typography>

                        <Typography variant="h5" sx={{
                            fontFamily: 'Georgia, serif',
                            color: '#1976d2',
                            my: 2,
                            textTransform: 'uppercase',
                            fontWeight: 'bold'
                        }}>
                            {certificateData.membershipCategory} {certificateData.membershipType} Member
                        </Typography>

                        {certificateData.familyMembers && certificateData.familyMembers.length > 0 && (
                            <Box sx={{ my: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                    Family Members Included:
                                </Typography>
                                {certificateData.familyMembers.map((fm, index) => (
                                    <Typography key={index} variant="body2">
                                        {fm.name} ({fm.relationship}) - {fm.referenceNo}
                                    </Typography>
                                ))}
                            </Box>
                        )}

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                            <Box sx={{ textAlign: 'center', minWidth: 200 }}>
                                <Typography variant="caption" display="block" sx={{ color: '#666' }}>
                                    Reference Number
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {certificateData.referenceNo}
                                </Typography>
                            </Box>

                            <Box sx={{ textAlign: 'center', minWidth: 200 }}>
                                <Typography variant="caption" display="block" sx={{ color: '#666' }}>
                                    Membership Start Date
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                    {formatDate(certificateData.membershipStartDate)}
                                </Typography>
                            </Box>

                            {certificateData.expiryDate && (
                                <Box sx={{ textAlign: 'center', minWidth: 200 }}>
                                    <Typography variant="caption" display="block" sx={{ color: '#666' }}>
                                        Valid Until
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {formatDate(certificateData.expiryDate)}
                                    </Typography>
                                </Box>
                            )}

                            {!certificateData.expiryDate && certificateData.membershipCategory === 'life' && (
                                <Box sx={{ textAlign: 'center', minWidth: 200 }}>
                                    <Typography variant="caption" display="block" sx={{ color: '#666' }}>
                                        Validity
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                                        LIFETIME
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Certificate Footer */}
                    <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #ddd' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Box sx={{ borderTop: '1px solid #000', pt: 1, px: 4, display: 'inline-block' }}>
                                    <Typography variant="caption">
                                        Date of Issue
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {formatDate(certificateData.issueDate)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Box sx={{ borderTop: '1px solid #000', pt: 1, px: 4, display: 'inline-block' }}>
                                    <Typography variant="caption">
                                        Authorized Signature
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
                                        ANMC Official
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                <Button onClick={onClose}>Close</Button>
                <Box>
                    <Button
                        startIcon={<PrintIcon />}
                        variant="contained"
                        onClick={handlePrint}
                        sx={{ mr: 1 }}
                    >
                        Print
                    </Button>
                </Box>
            </DialogActions>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .certificate-container, .certificate-container * {
                        visibility: visible;
                    }
                    .certificate-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                }
            `}</style>
        </Dialog>
    );
};

export default MembershipCertificate;
