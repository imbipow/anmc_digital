const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const config = require('../config');

// Initialize SES client
const sesClient = new SESClient({
    region: process.env.AWS_REGION || 'ap-southeast-2'
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@anmc.org.au';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@anmc.org.au';

/**
 * Send booking request notification to member
 */
const sendBookingRequestEmail = async (bookingData) => {
    const { memberEmail, memberName, serviceName, preferredDate, startTime, endTime, numberOfPeople, totalAmount } = bookingData;

    const emailBody = `
Dear ${memberName},

Thank you for your booking request at ANMC (Australian Nepalese Multicultural Centre).

Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service: ${serviceName}
Date: ${new Date(preferredDate).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time Slot: ${formatTime(startTime)} - ${formatTime(endTime)}
Number of Attendees: ${numberOfPeople}
Total Amount: $${totalAmount.toFixed(2)} AUD

Status: Pending Approval
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your booking request has been received and is currently pending approval from our team.
You will receive a confirmation email once your booking has been approved.

Please note: Payment will be required to confirm your booking.

If you have any questions, please contact us at ${ADMIN_EMAIL}.

Best regards,
ANMC Team
Australian Nepalese Multicultural Centre
    `.trim();

    const params = {
        Source: FROM_EMAIL,
        Destination: {
            ToAddresses: [memberEmail]
        },
        Message: {
            Subject: {
                Data: 'ANMC Booking Request Received',
                Charset: 'UTF-8'
            },
            Body: {
                Text: {
                    Data: emailBody,
                    Charset: 'UTF-8'
                }
            }
        }
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('Booking request email sent successfully:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending booking request email:', error);
        throw error;
    }
};

/**
 * Send booking request notification to admin
 */
const sendBookingNotificationToAdmin = async (bookingData) => {
    const { id, memberEmail, memberName, memberContact, serviceName, preferredDate, startTime, endTime, numberOfPeople, totalAmount, specialRequirements } = bookingData;

    const emailBody = `
New Booking Request Received

Booking ID: ${id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Member Information:
- Name: ${memberName}
- Email: ${memberEmail}
- Contact: ${memberContact || 'Not provided'}

Service Details:
- Service: ${serviceName}
- Date: ${new Date(preferredDate).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Time: ${formatTime(startTime)} - ${formatTime(endTime)}
- Attendees: ${numberOfPeople}
- Total Amount: $${totalAmount.toFixed(2)} AUD

${specialRequirements ? `Special Requirements:\n${specialRequirements}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please review and approve this booking request in the admin panel.

Login to Admin Panel: ${process.env.ADMIN_PANEL_URL || 'https://anmc.org.au/admin'}
    `.trim();

    const params = {
        Source: FROM_EMAIL,
        Destination: {
            ToAddresses: [ADMIN_EMAIL]
        },
        Message: {
            Subject: {
                Data: `New Booking Request - ${serviceName}`,
                Charset: 'UTF-8'
            },
            Body: {
                Text: {
                    Data: emailBody,
                    Charset: 'UTF-8'
                }
            }
        }
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('Admin notification email sent successfully:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending admin notification email:', error);
        throw error;
    }
};

/**
 * Send booking confirmation email with payment link
 */
const sendBookingConfirmationEmail = async (bookingData, paymentLink) => {
    const { memberEmail, memberName, serviceName, preferredDate, startTime, endTime, numberOfPeople, totalAmount, venue } = bookingData;

    const emailBody = `
Dear ${memberName},

Great news! Your booking has been approved by ANMC.

Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Service: ${serviceName}
Date: ${new Date(preferredDate).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time Slot: ${formatTime(startTime)} - ${formatTime(endTime)}
${venue ? `Venue: ${venue}\n` : ''}Number of Attendees: ${numberOfPeople}
Total Amount: $${totalAmount.toFixed(2)} AUD

Status: CONFIRMED - Payment Required
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMPORTANT: Please complete your payment to finalize your booking.

Payment Link: ${paymentLink}

Your booking will be secured once payment is received. The payment link is valid for 24 hours.

Important Information:
• Please arrive 10 minutes before your scheduled time
• Ensure you have adequate arrangements for the number of attendees
• Contact us if you need to make any changes to your booking

If you have any questions or need assistance, please contact us at ${ADMIN_EMAIL}.

We look forward to serving you!

Best regards,
ANMC Team
Australian Nepalese Multicultural Centre
    `.trim();

    const params = {
        Source: FROM_EMAIL,
        Destination: {
            ToAddresses: [memberEmail]
        },
        Message: {
            Subject: {
                Data: 'ANMC Booking Confirmed - Payment Required',
                Charset: 'UTF-8'
            },
            Body: {
                Text: {
                    Data: emailBody,
                    Charset: 'UTF-8'
                }
            }
        }
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('Booking confirmation email sent successfully:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending booking confirmation email:', error);
        throw error;
    }
};

/**
 * Send payment success email
 */
const sendPaymentSuccessEmail = async (bookingData) => {
    const { memberEmail, memberName, serviceName, preferredDate, startTime, endTime, numberOfPeople, totalAmount, venue, id } = bookingData;

    const emailBody = `
Dear ${memberName},

Thank you for your payment! Your booking is now fully confirmed.

Booking Confirmation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID: ${id}
Service: ${serviceName}
Date: ${new Date(preferredDate).toLocaleDateString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${formatTime(startTime)} - ${formatTime(endTime)}
${venue ? `Venue: ${venue}\n` : ''}Attendees: ${numberOfPeople}
Amount Paid: $${totalAmount.toFixed(2)} AUD

Status: CONFIRMED & PAID ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your payment has been successfully processed and your booking is confirmed.

Important Reminders:
• Please arrive 10 minutes before your scheduled time
• Bring a copy of this email for reference
• Contact us at least 48 hours in advance if you need to reschedule

Location:
Australian Nepalese Multicultural Centre
[Address details]

If you have any questions, please contact us at ${ADMIN_EMAIL}.

We look forward to serving you!

Best regards,
ANMC Team
Australian Nepalese Multicultural Centre
    `.trim();

    const params = {
        Source: FROM_EMAIL,
        Destination: {
            ToAddresses: [memberEmail]
        },
        Message: {
            Subject: {
                Data: `ANMC Booking Confirmed - Payment Received`,
                Charset: 'UTF-8'
            },
            Body: {
                Text: {
                    Data: emailBody,
                    Charset: 'UTF-8'
                }
            }
        }
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('Payment success email sent successfully:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending payment success email:', error);
        throw error;
    }
};

/**
 * Format time from 24-hour to 12-hour format
 */
function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
}

/**
 * Send contact form email to admin
 */
const sendContactFormEmail = async (contactData) => {
    const { name, email, phone, subject, message } = contactData;

    const emailBody = `
New Contact Form Submission

Contact Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}\n` : ''}Subject: ${subject}

Message:
${message}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Submitted: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}

Reply to this contact via: ${email}
    `.trim();

    const params = {
        Source: FROM_EMAIL,
        Destination: {
            ToAddresses: [ADMIN_EMAIL]
        },
        Message: {
            Subject: {
                Data: `Contact Form: ${subject}`,
                Charset: 'UTF-8'
            },
            Body: {
                Text: {
                    Data: emailBody,
                    Charset: 'UTF-8'
                }
            }
        },
        ReplyToAddresses: [email]
    };

    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('Contact form email sent successfully:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending contact form email:', error);
        throw error;
    }
};

/**
 * Send broadcast email to multiple recipients
 */
const sendBroadcastEmail = async (broadcastData) => {
    const { subject, message, recipients } = broadcastData;

    // Send emails in batches of 50 (SES limit)
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
        batches.push(recipients.slice(i, i + batchSize));
    }

    const results = [];

    for (const batch of batches) {
        const emailBody = `
${message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This email was sent by ANMC (Australian Nepalese Multicultural Centre)

To unsubscribe from these emails, please visit:
${process.env.FRONTEND_URL || 'https://anmc.org.au'}/unsubscribe

Best regards,
ANMC Team
        `.trim();

        const params = {
            Source: FROM_EMAIL,
            Destination: {
                BccAddresses: batch // Use BCC to hide recipient emails
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8'
                },
                Body: {
                    Text: {
                        Data: emailBody,
                        Charset: 'UTF-8'
                    }
                }
            }
        };

        try {
            const command = new SendEmailCommand(params);
            const response = await sesClient.send(command);
            console.log(`Broadcast email batch sent successfully: ${response.MessageId}`);
            results.push({ success: true, messageId: response.MessageId, recipientCount: batch.length });
        } catch (error) {
            console.error('Error sending broadcast email batch:', error);
            results.push({ success: false, error: error.message, recipientCount: batch.length });
        }
    }

    return results;
};

module.exports = {
    sendBookingRequestEmail,
    sendBookingNotificationToAdmin,
    sendBookingConfirmationEmail,
    sendPaymentSuccessEmail,
    sendContactFormEmail,
    sendBroadcastEmail
};
