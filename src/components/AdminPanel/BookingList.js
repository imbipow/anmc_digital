import React, { useState } from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    BooleanField,
    EmailField,
    ChipField,
    FunctionField,
    EditButton,
    ShowButton,
    FilterButton,
    TopToolbar,
    SelectColumnsButton,
    ExportButton,
    CreateButton,
    usePermissions,
    Button,
    useUpdate,
    useNotify,
    useRefresh,
    useListContext
} from 'react-admin';
import { Chip, Button as MuiButton, Box, Typography, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { tableHeaderStyles } from './commonTableStyles';

const ListActions = () => {
    const { permissions } = usePermissions();

    return (
        <TopToolbar>
            <FilterButton />
            <SelectColumnsButton />
            <ExportButton />
        </TopToolbar>
    );
};

const statusColors = {
    pending: '#ff9800',
    confirmed: '#2196f3',
    completed: '#4caf50',
    cancelled: '#f44336'
};

const StatusField = ({ record }) => {
    if (!record) return null;

    return (
        <Chip
            label={record.status.toUpperCase()}
            size="small"
            sx={{
                backgroundColor: statusColors[record.status],
                color: 'white',
                fontWeight: 'bold'
            }}
        />
    );
};

const ApproveButton = ({ record }) => {
    const [update, { isLoading }] = useUpdate();
    const notify = useNotify();
    const refresh = useRefresh();

    if (!record || record.status !== 'pending') return null;

    const handleApprove = (e) => {
        e.stopPropagation();
        update(
            'bookings',
            {
                id: record.id,
                data: { ...record, status: 'confirmed' },
                previousData: record
            },
            {
                onSuccess: () => {
                    notify('Booking approved successfully', { type: 'success' });
                    refresh();
                },
                onError: () => {
                    notify('Error approving booking', { type: 'error' });
                }
            }
        );
    };

    return (
        <MuiButton
            size="small"
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleApprove}
            disabled={isLoading}
            sx={{ minWidth: '100px' }}
        >
            Approve
        </MuiButton>
    );
};

const GroupedBookingList = () => {
    const { data, isLoading } = useListContext();

    if (isLoading || !data) return null;

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Separate bookings into upcoming and past
    const upcomingBookings = [];
    const pastBookings = [];

    data.forEach(booking => {
        const bookingDate = new Date(booking.preferredDate);
        bookingDate.setHours(0, 0, 0, 0);

        if (bookingDate >= today) {
            upcomingBookings.push(booking);
        } else {
            pastBookings.push(booking);
        }
    });

    // Group bookings by date - normalize the date to ensure same dates are grouped together
    const groupBookingsByDate = (bookings) => {
        return bookings.reduce((groups, booking) => {
            // Extract just the date part (YYYY-MM-DD) to ensure proper grouping
            const dateObj = new Date(booking.preferredDate);
            const dateKey = dateObj.toISOString().split('T')[0];

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(booking);
            return groups;
        }, {});
    };

    const upcomingGrouped = groupBookingsByDate(upcomingBookings);
    const pastGrouped = groupBookingsByDate(pastBookings);

    // Sort dates - upcoming ascending, past descending
    const upcomingSortedDates = Object.keys(upcomingGrouped).sort();
    const pastSortedDates = Object.keys(pastGrouped).sort((a, b) => b.localeCompare(a));

    const formatDateHeader = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderBookingTable = (groupedBookings, sortedDates, headerColor, title, showApproveButton = true) => {
        if (sortedDates.length === 0) {
            return (
                <Box sx={{ p: 3, textAlign: 'center', color: '#666' }}>
                    <Typography variant="body1">No {title.toLowerCase()} bookings</Typography>
                </Box>
            );
        }

        return (
            <Box sx={{ border: '1px solid #e0e0e0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: headerColor, color: 'white' }}>
                            <th style={{ padding: '12px 8px', textAlign: 'left', width: '120px' }}>Date</th>
                            <th style={{ padding: '12px 8px', textAlign: 'left', width: '60px' }}>ID</th>
                            <th style={{ padding: '12px 8px', textAlign: 'left', width: '100px' }}>Status</th>
                            <th style={{ padding: '12px 8px', textAlign: 'left', width: '150px' }}>Service</th>
                            <th style={{ padding: '12px 8px', textAlign: 'left', width: '90px' }}>Time</th>
                            <th style={{ padding: '12px 8px', textAlign: 'left', width: '60px' }}>Hrs</th>
                            <th style={{ padding: '12px 8px', textAlign: 'left', width: '60px' }}>Ppl</th>
                            <th style={{ padding: '12px 8px', textAlign: 'left', width: '180px' }}>Email</th>
                            <th style={{ padding: '12px 8px', textAlign: 'left', width: '90px' }}>Total</th>
                            {showApproveButton && (
                                <th style={{ padding: '12px 8px', textAlign: 'left', width: '110px' }}>Action</th>
                            )}
                            <th style={{ padding: '12px 8px', textAlign: 'center', width: '140px' }}>Operations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedDates.map((date) => {
                            const bookings = groupedBookings[date];
                            const pendingCount = bookings.filter(b => b.status === 'pending').length;
                            const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
                            const completedCount = bookings.filter(b => b.status === 'completed').length;
                            const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

                            return bookings.map((booking, index) => {
                                const [hours, minutes] = (booking.startTime || '').split(':');
                                const hour = parseInt(hours || 0);
                                const period = hour >= 12 ? 'PM' : 'AM';
                                const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                                const timeDisplay = booking.startTime ? `${displayHour}:${minutes} ${period}` : '-';

                                const serviceName = booking.serviceName
                                    ? (booking.serviceName.match(/^([^:\/]+)/) || [])[1]?.trim() || booking.serviceName
                                    : '-';

                                const isFirstInGroup = index === 0;

                                return (
                                    <tr
                                        key={booking.id}
                                        style={{
                                            borderBottom: '1px solid #e0e0e0',
                                            cursor: 'pointer',
                                            backgroundColor: isFirstInGroup ? '#f5f9ff' : 'white'
                                        }}
                                        onMouseOver={(e) => {
                                            if (!isFirstInGroup) {
                                                e.currentTarget.style.backgroundColor = '#f5f9ff';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (!isFirstInGroup) {
                                                e.currentTarget.style.backgroundColor = 'white';
                                            } else {
                                                e.currentTarget.style.backgroundColor = '#f5f9ff';
                                            }
                                        }}
                                        onClick={() => window.location.hash = `#/bookings/${booking.id}/show`}
                                    >
                                        {isFirstInGroup ? (
                                            <td
                                                rowSpan={bookings.length}
                                                style={{
                                                    padding: '12px 8px',
                                                    backgroundColor: '#e3f2fd',
                                                    fontWeight: 'bold',
                                                    verticalAlign: 'top',
                                                    borderRight: '2px solid #1976d2'
                                                }}
                                            >
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                                                        {formatDateHeader(date)}
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        {pendingCount > 0 && (
                                                            <Chip
                                                                label={`${pendingCount} Pending`}
                                                                size="small"
                                                                sx={{ backgroundColor: '#ff9800', color: 'white', fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                        {confirmedCount > 0 && (
                                                            <Chip
                                                                label={`${confirmedCount} Confirmed`}
                                                                size="small"
                                                                sx={{ backgroundColor: '#2196f3', color: 'white', fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                        {completedCount > 0 && (
                                                            <Chip
                                                                label={`${completedCount} Completed`}
                                                                size="small"
                                                                sx={{ backgroundColor: '#4caf50', color: 'white', fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                        {cancelledCount > 0 && (
                                                            <Chip
                                                                label={`${cancelledCount} Cancelled`}
                                                                size="small"
                                                                sx={{ backgroundColor: '#f44336', color: 'white', fontSize: '0.7rem' }}
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            </td>
                                        ) : null}
                                        <td style={{ padding: '12px 8px' }}>{booking.id}</td>
                                        <td style={{ padding: '12px 8px' }}>
                                            <StatusField record={booking} />
                                        </td>
                                        <td style={{ padding: '12px 8px' }}>{serviceName}</td>
                                        <td style={{ padding: '12px 8px' }}>{timeDisplay}</td>
                                        <td style={{ padding: '12px 8px' }}>{booking.serviceDuration}</td>
                                        <td style={{ padding: '12px 8px' }}>{booking.numberOfPeople}</td>
                                        <td style={{ padding: '12px 8px' }}>{booking.memberEmail}</td>
                                        <td style={{ padding: '12px 8px' }}>
                                            ${booking.totalAmount.toFixed(2)}
                                        </td>
                                        {showApproveButton && (
                                            <td style={{ padding: '12px 8px' }} onClick={(e) => e.stopPropagation()}>
                                                <ApproveButton record={booking} />
                                            </td>
                                        )}
                                        <td style={{ padding: '12px 8px', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                            <ShowButton record={booking} />
                                            <EditButton record={booking} />
                                        </td>
                                    </tr>
                                );
                            });
                        })}
                    </tbody>
                </table>
            </Box>
        );
    };

    return (
        <Box>
            {/* Upcoming Bookings Section */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{
                    backgroundColor: '#1976d2',
                    color: 'white',
                    p: 2,
                    mb: 2,
                    borderRadius: '4px 4px 0 0'
                }}>
                    <Typography variant="h6" fontWeight="bold">
                        Upcoming Bookings ({upcomingBookings.length})
                    </Typography>
                </Box>
                {renderBookingTable(upcomingGrouped, upcomingSortedDates, '#1976d2', 'Upcoming', true)}
            </Box>

            {/* Past Bookings Section */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{
                    backgroundColor: '#757575',
                    color: 'white',
                    p: 2,
                    mb: 2,
                    borderRadius: '4px 4px 0 0'
                }}>
                    <Typography variant="h6" fontWeight="bold">
                        Past Bookings ({pastBookings.length})
                    </Typography>
                </Box>
                {renderBookingTable(pastGrouped, pastSortedDates, '#757575', 'Past', false)}
            </Box>
        </Box>
    );
};

export const BookingList = (props) => {
    const { permissions } = usePermissions();

    return (
        <List
            {...props}
            sort={{ field: 'preferredDate', order: 'ASC' }}
            perPage={100}
            actions={<ListActions />}
            filters={[]}
        >
            <GroupedBookingList />
        </List>
    );
};

export default BookingList;
