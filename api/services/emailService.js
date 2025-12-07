const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { fromInstanceMetadata } = require('@aws-sdk/credential-providers');
const config = require('../config');
const secretsManager = require('./secretsManager');

// Initialize SES client with proper credentials
let sesClient = null;
let awsCredentials = null;
let emailConfig = {
    adminEmail: process.env.ADMIN_EMAIL || 'admin@anmcinc.org.au',
    fromEmail: process.env.FROM_EMAIL || 'noreply@anmcinc.org.au'
};

// Initialize email configuration from Secrets Manager in production
async function initializeEmailConfig() {
    if (process.env.NODE_ENV === 'production') {
        try {
            console.log('🔐 Loading email and AWS configuration from AWS Secrets Manager...');

            // Load both application config and AWS credentials
            const [appConfig, awsCreds] = await Promise.all([
                secretsManager.getSecret('application-config'),
                secretsManager.getSecret('aws-credentials')
            ]);

            // Set email configuration
            if (appConfig.ADMIN_EMAIL) emailConfig.adminEmail = appConfig.ADMIN_EMAIL;
            if (appConfig.FROM_EMAIL) emailConfig.fromEmail = appConfig.FROM_EMAIL;

            // Store AWS credentials for SES client
            if (awsCreds.AWS_ACCESS_KEY_ID && awsCreds.AWS_SECRET_ACCESS_KEY) {
                awsCredentials = {
                    accessKeyId: awsCreds.AWS_ACCESS_KEY_ID,
                    secretAccessKey: awsCreds.AWS_SECRET_ACCESS_KEY
                };
                console.log('✅ AWS credentials loaded from Secrets Manager for SES');
            }

            console.log('✅ Email configuration loaded from Secrets Manager');
            console.log(`   FROM_EMAIL: ${emailConfig.fromEmail}`);
            console.log(`   ADMIN_EMAIL: ${emailConfig.adminEmail}`);
        } catch (error) {
            console.warn('⚠️  Failed to load config from Secrets Manager, using defaults:', error.message);
        }
    } else {
        console.log('📧 Using email configuration from environment variables');
        console.log(`   FROM_EMAIL: ${emailConfig.fromEmail}`);
        console.log(`   ADMIN_EMAIL: ${emailConfig.adminEmail}`);
    }
}

function getSESClient() {
    if (!sesClient) {
        const clientConfig = {
            region: process.env.AWS_REGION || 'ap-southeast-2'
        };

        // In production (Elastic Beanstalk), use credentials from Secrets Manager or EC2 instance metadata
        if (process.env.NODE_ENV === 'production') {
            if (awsCredentials) {
                // Use credentials loaded from Secrets Manager
                clientConfig.credentials = awsCredentials;
                console.log('🔐 Using AWS credentials from Secrets Manager for SES');
            } else {
                // Fallback to EC2 instance metadata
                clientConfig.credentials = fromInstanceMetadata({
                    timeout: 5000,
                    maxRetries: 10
                });
                console.log('🔐 Using EC2 instance profile credentials for SES (SDK v3)');
            }
        } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            // Development: use explicit credentials from environment variables
            clientConfig.credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            };
            console.log('🔐 Using explicit credentials for SES (development)');
        } else {
            // Development: use default AWS credential provider chain
            // This will automatically use credentials from ~/.aws/credentials or environment
            console.log('🔐 Using default AWS credential provider chain for SES (will check ~/.aws/credentials, env vars, etc.)');
        }

        sesClient = new SESClient(clientConfig);
        console.log('✅ SES client initialized successfully');
    }
    return sesClient;
}

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

If you have any questions, please contact us at ${emailConfig.adminEmail}.

Best regards,
ANMC Team
Australian Nepalese Multicultural Centre
    `.trim();

    const params = {
        Source: emailConfig.fromEmail,
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
        const client = getSESClient();
        const response = await client.send(command);
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

Login to Admin Panel: ${process.env.ADMIN_PANEL_URL || 'https://anmcinc.org.au/admin'}
    `.trim();

    const params = {
        Source: emailConfig.fromEmail,
        Destination: {
            ToAddresses: [emailConfig.adminEmail]
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
        const client = getSESClient();
        const response = await client.send(command);
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

If you have any questions or need assistance, please contact us at ${emailConfig.adminEmail}.

We look forward to serving you!

Best regards,
ANMC Team
Australian Nepalese Multicultural Centre
    `.trim();

    const params = {
        Source: emailConfig.fromEmail,
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
        const client = getSESClient();
        const response = await client.send(command);
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
100 Duncans Lane, Diggers Rest VIC 3427

If you have any questions, please contact us at ${emailConfig.adminEmail}.

We look forward to serving you!

Best regards,
ANMC Team
Australian Nepalese Multicultural Centre
    `.trim();

    const params = {
        Source: emailConfig.fromEmail,
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
        const client = getSESClient();
        const response = await client.send(command);
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
        Source: emailConfig.fromEmail,
        Destination: {
            ToAddresses: [emailConfig.adminEmail]
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
        const client = getSESClient();
        const response = await client.send(command);
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
    const { subject, message, recipients, isHtml, isReply } = broadcastData;

    // Send emails in batches of 50 (SES limit)
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
        batches.push(recipients.slice(i, i + batchSize));
    }

    const results = [];

    for (const batch of batches) {
        const unsubscribeLink = `${process.env.FRONTEND_URL || 'https://anmcinc.org.au'}/unsubscribe`;

        let emailBody, htmlBody;

        if (isHtml) {
            // HTML email with footer
            // Only include unsubscribe link for bulk broadcasts, not for replies
            const footer = isReply ? `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; color: #666; font-size: 12px;">
        <p>This email was sent by ANMC (Australian Nepalese Multicultural Centre)</p>
        <p>Best regards,<br>ANMC Team</p>
    </div>` : `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; color: #666; font-size: 12px;">
        <p>This email was sent by ANMC (Australian Nepalese Multicultural Centre)</p>
        <p>To unsubscribe from these emails, please visit: <a href="${unsubscribeLink}" style="color: #1976d2;">Unsubscribe</a></p>
        <p>Best regards,<br>ANMC Team</p>
    </div>`;

            htmlBody = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    ${message}
${footer}
</body>
</html>
            `.trim();

            // Plain text version (fallback)
            const plainFooter = isReply ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This email was sent by ANMC (Australian Nepalese Multicultural Centre)

Best regards,
ANMC Team` : `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This email was sent by ANMC (Australian Nepalese Multicultural Centre)

To unsubscribe from these emails, please visit:
${unsubscribeLink}

Best regards,
ANMC Team`;

            emailBody = `
${message.replace(/<[^>]*>/g, '')}
${plainFooter}
            `.trim();
        } else {
            // Plain text email
            const plainFooter = isReply ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This email was sent by ANMC (Australian Nepalese Multicultural Centre)

Best regards,
ANMC Team` : `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This email was sent by ANMC (Australian Nepalese Multicultural Centre)

To unsubscribe from these emails, please visit:
${unsubscribeLink}

Best regards,
ANMC Team`;

            emailBody = `
${message}
${plainFooter}
            `.trim();
        }

        const params = {
            Source: emailConfig.fromEmail,
            Destination: {
                BccAddresses: batch // Use BCC to hide recipient emails
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8'
                },
                Body: isHtml ? {
                    Text: {
                        Data: emailBody,
                        Charset: 'UTF-8'
                    },
                    Html: {
                        Data: htmlBody,
                        Charset: 'UTF-8'
                    }
                } : {
                    Text: {
                        Data: emailBody,
                        Charset: 'UTF-8'
                    }
                }
            }
        };

        try {
            const command = new SendEmailCommand(params);
            const client = getSESClient();
            const response = await client.send(command);
            console.log(`Broadcast email batch sent successfully: ${response.MessageId}`);
            results.push({ success: true, messageId: response.MessageId, recipientCount: batch.length });
        } catch (error) {
            console.error('Error sending broadcast email batch:', error);
            results.push({ success: false, error: error.message, recipientCount: batch.length });
        }
    }

    return results;
};

/**
 * Send welcome email to new member after registration
 */
const sendMemberWelcomeEmail = async (memberData) => {
    const { email, firstName, lastName, referenceNo } = memberData;

    const emailBody = `
Dear ${firstName} ${lastName},

Thank you for registering with ANMC (Australian Nepalese Multicultural Centre)!

Your Registration Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Member Reference: ${referenceNo}
Email: ${email}
Status: Pending Approval
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your membership application has been received and is currently pending approval from our team.
You will receive a confirmation email once your membership has been approved by an administrator.

Please note: You will be able to login and access member features once your account is approved.

If you have any questions, please contact us at ${emailConfig.adminEmail}.

Best regards,
ANMC Team
Australian Nepalese Multicultural Centre
    `.trim();

    const params = {
        Source: emailConfig.fromEmail,
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Subject: {
                Data: 'Welcome to ANMC - Registration Received',
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
        const client = getSESClient();
        const response = await client.send(command);
        console.log('Member welcome email sent successfully:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending member welcome email:', error);
        throw error;
    }
};

/**
 * Send approval email to member
 */
const sendMemberApprovalEmail = async (memberData) => {
    const { email, firstName, lastName, referenceNo } = memberData;

    const emailBody = `
Dear ${firstName} ${lastName},

Congratulations! Your ANMC membership has been approved.

Your Membership Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Member Reference: ${referenceNo}
Email: ${email}
Status: Active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You can now login to the member portal and access all member features:
https://anmcinc.org.au/member-login

Member Benefits:
• Book temple services and puja
• Access exclusive member content
• Participate in ANMC events and programs
• Connect with the Nepalese Australian community

If you have any questions or need assistance, please contact us at ${emailConfig.adminEmail}.

Welcome to the ANMC community!

Best regards,
ANMC Team
Australian Nepalese Multicultural Centre
    `.trim();

    const params = {
        Source: emailConfig.fromEmail,
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Subject: {
                Data: 'ANMC Membership Approved - Welcome!',
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
        const client = getSESClient();
        const response = await client.send(command);
        console.log('Member approval email sent successfully:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending member approval email:', error);
        throw error;
    }
};

/**
 * Send welcome email to new regular user after registration
 */
const sendUserWelcomeEmail = async (userData) => {
    const { email, firstName, lastName } = userData;

    const emailBody = `
Dear ${firstName} ${lastName},

Welcome to ANMC (Australian Nepalese Multicultural Centre)!

Your Registration Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email: ${email}
Account Type: User
Status: Active
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your account has been created successfully. You can now:
• Book temple services and puja
• View upcoming events
• Contact ANMC for information

Login to your account:
${process.env.FRONTEND_URL || 'https://anmcinc.org.au'}/login

If you're interested in becoming a member to access exclusive benefits, please visit:
${process.env.FRONTEND_URL || 'https://anmcinc.org.au'}/membership

If you have any questions, please contact us at ${emailConfig.adminEmail}.

Best regards,
ANMC Team
Australian Nepalese Multicultural Centre
    `.trim();

    const params = {
        Source: emailConfig.fromEmail,
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Subject: {
                Data: 'Welcome to ANMC - Account Created',
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
        const client = getSESClient();
        const response = await client.send(command);
        console.log('User welcome email sent successfully:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending user welcome email:', error);
        throw error;
    }
};

/**
 * Send new member registration notification to admin
 */
const sendNewMemberNotificationToAdmin = async (memberData) => {
    const { firstName, lastName, email, phone, referenceNo, membershipType, membershipCategory, address, suburb, state, postcode, familyMembers } = memberData;

    let emailBody = `
New Member Registration
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A new member has registered on the ANMC website.

Member Details:
- Reference No: ${referenceNo || 'Pending'}
- Name: ${firstName} ${lastName}
- Email: ${email}
- Phone: ${phone || 'Not provided'}

Membership Information:
- Type: ${membershipType || 'Individual'}
- Category: ${membershipCategory || 'Standard'}

Address:
${address || ''}
${suburb || ''} ${state || ''} ${postcode || ''}
`.trim();

    // Add family members info if applicable
    if (familyMembers && familyMembers.length > 0) {
        emailBody += `

Family Members (${familyMembers.length}):`;
        familyMembers.forEach((fm, index) => {
            emailBody += `
  ${index + 1}. ${fm.firstName} ${fm.lastName} - ${fm.email}`;
        });
    }

    emailBody += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: Pending Approval

Please review and approve this member in the admin panel.
Login to Admin Panel: ${process.env.ADMIN_PANEL_URL || 'https://anmcinc.org.au/admin'}

Submitted: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
    `.trim();

    const params = {
        Source: emailConfig.fromEmail,
        Destination: {
            ToAddresses: [emailConfig.adminEmail]
        },
        Message: {
            Subject: {
                Data: `New Member Registration - ${firstName} ${lastName}`,
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
        const client = getSESClient();
        const response = await client.send(command);
        console.log('New member admin notification sent successfully:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending new member admin notification:', error);
        throw error;
    }
};

/**
 * Send donation notification to admin
 */
const sendDonationNotificationToAdmin = async (donationData) => {
    const { firstName, lastName, email, phone, amount, donationType, message, isRecurring, paymentStatus, id } = donationData;

    const emailBody = `
New Donation Received
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A new donation has been received on the ANMC website.

Donation ID: ${id || 'N/A'}

Donor Information:
- Name: ${firstName} ${lastName}
- Email: ${email}
- Phone: ${phone || 'Not provided'}

Donation Details:
- Amount: $${parseFloat(amount).toFixed(2)} AUD
- Type: ${donationType || 'General Donation'}
- Recurring: ${isRecurring ? 'Yes' : 'No'}
- Payment Status: ${paymentStatus || 'Pending'}

${message ? `Message from Donor:\n${message}\n` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

View donation details in the admin panel.
Login to Admin Panel: ${process.env.ADMIN_PANEL_URL || 'https://anmcinc.org.au/admin'}

Received: ${new Date().toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })}
    `.trim();

    const params = {
        Source: emailConfig.fromEmail,
        Destination: {
            ToAddresses: [emailConfig.adminEmail]
        },
        Message: {
            Subject: {
                Data: `New Donation Received - $${parseFloat(amount).toFixed(2)} from ${firstName} ${lastName}`,
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
        const client = getSESClient();
        const response = await client.send(command);
        console.log('Donation admin notification sent successfully:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending donation admin notification:', error);
        throw error;
    }
};

/**
 * Send Kalash booking confirmation email
 */
const sendKalashBookingConfirmation = async (bookingData) => {
    const { id, name, email, phone, numberOfKalash, amount } = bookingData;

    const emailBody = `
Dear ${name},

Thank you for your Kalash booking! Your payment has been successfully received and your booking is confirmed.

Kalash Booking Confirmation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID: ${id}
Number of Kalash: ${numberOfKalash}
Amount Paid: $${amount.toFixed(2)} AUD

Contact Details:
Name: ${name}
Email: ${email}
Phone: ${phone}

Status: CONFIRMED & PAID ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 COLLECTION INSTRUCTIONS:

You can collect your Kalash from the Mandir during the event.

⚠️ IMPORTANT: Please bring proof of payment when collecting your Kalash.

What to bring for collection:
• Your Booking ID: ${id}
• Printed confirmation email or show on your phone
• Valid ID (Driver's License or Passport)
• Payment receipt (this email)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Important Information:
• Please keep this booking ID for your records
• Contact us if you need any special arrangements
• Reach out at least 24 hours in advance for any changes

Location:
Australian Nepalese Multicultural Centre
100 Duncans Lane, Diggers Rest VIC 3427

If you have any questions, please contact us at ${emailConfig.adminEmail}.

We look forward to serving you!

Best regards,
ANMC Team
Australian Nepalese Multicultural Centre
    `.trim();

    const params = {
        Source: emailConfig.fromEmail,
        Destination: {
            ToAddresses: [email]
        },
        Message: {
            Subject: {
                Data: `ANMC Kalash Booking Confirmed - ${id}`,
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
        const client = getSESClient();
        const response = await client.send(command);
        console.log('Kalash booking confirmation email sent successfully:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending Kalash booking confirmation email:', error);
        throw error;
    }
};

/**
 * Send Kalash booking notification to admin
 */
const sendKalashBookingNotificationToAdmin = async (bookingData) => {
    const { id, name, email, phone, numberOfKalash, amount, createdAt } = bookingData;

    const emailBody = `
New Kalash Booking Received!

A new Kalash booking has been made through the website.

Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID: ${id}
Date & Time: ${new Date(createdAt).toLocaleString('en-AU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}

Customer Information:
Name: ${name}
Email: ${email}
Phone: ${phone}

Order Details:
Number of Kalash: ${numberOfKalash}
Amount: $${amount.toFixed(2)} AUD

Status: Payment Pending
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please monitor this booking in the admin panel for payment confirmation.

Admin Panel: ${process.env.FRONTEND_URL || 'https://anmcinc.org.au'}/admin#/kalash-bookings/${id}

This is an automated notification from the ANMC website.
    `.trim();

    const params = {
        Source: emailConfig.fromEmail,
        Destination: {
            ToAddresses: [emailConfig.adminEmail]
        },
        Message: {
            Subject: {
                Data: `🔔 New Kalash Booking - ${id}`,
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
        const client = getSESClient();
        const response = await client.send(command);
        console.log('Kalash booking admin notification sent successfully:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending Kalash booking admin notification:', error);
        throw error;
    }
};

/**
 * Generic send email function for custom emails
 * @param {Object} emailData - Email data including to, subject, html/text
 * @returns {Promise<Object>} - Result with success status and message ID
 */
const sendEmail = async (emailData) => {
    const { to, subject, html, text } = emailData;

    const params = {
        Source: emailConfig.fromEmail,
        Destination: {
            ToAddresses: Array.isArray(to) ? to : [to]
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8'
            },
            Body: {}
        }
    };

    // Add HTML body if provided
    if (html) {
        params.Message.Body.Html = {
            Data: html,
            Charset: 'UTF-8'
        };
    }

    // Add text body if provided
    if (text) {
        params.Message.Body.Text = {
            Data: text,
            Charset: 'UTF-8'
        };
    }

    // If neither html nor text provided, throw error
    if (!html && !text) {
        throw new Error('Email must have either html or text body');
    }

    try {
        const command = new SendEmailCommand(params);
        const client = getSESClient();
        const response = await client.send(command);
        console.log('Email sent successfully to:', to, 'MessageId:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    initializeEmailConfig,
    sendEmail,
    sendBookingRequestEmail,
    sendBookingNotificationToAdmin,
    sendBookingConfirmationEmail,
    sendPaymentSuccessEmail,
    sendContactFormEmail,
    sendBroadcastEmail,
    sendMemberWelcomeEmail,
    sendMemberApprovalEmail,
    sendUserWelcomeEmail,
    sendNewMemberNotificationToAdmin,
    sendDonationNotificationToAdmin,
    sendKalashBookingConfirmation,
    sendKalashBookingNotificationToAdmin
};
