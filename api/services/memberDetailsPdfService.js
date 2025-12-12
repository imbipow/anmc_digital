const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

class MemberDetailsPdfService {
    /**
     * Generate a comprehensive member details PDF
     * @param {Object} memberData - Member information
     * @returns {Promise<Buffer>} - PDF as buffer
     */
    async generateMemberDetailsPdf(memberData) {
        try {
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595, 842]); // A4 size in points
            const { width, height } = page.getSize();

            const margin = 50;
            const contentWidth = width - (margin * 2);
            let yPosition = height - margin;

            // Embed fonts
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Helper functions
            const addText = (text, fontSize = 10, isBold = false, color = [0, 0, 0]) => {
                const font = isBold ? boldFont : regularFont;
                const textColor = rgb(color[0], color[1], color[2]);

                page.drawText(text, {
                    x: margin,
                    y: yPosition,
                    size: fontSize,
                    font: font,
                    color: textColor,
                });
                yPosition -= fontSize + 5;
            };

            const addSection = (title) => {
                yPosition -= 10;
                addText(title, 14, true, [0.12, 0.24, 0.45]);
                page.drawLine({
                    start: { x: margin, y: yPosition + 5 },
                    end: { x: width - margin, y: yPosition + 5 },
                    thickness: 1,
                    color: rgb(0.12, 0.24, 0.45),
                });
                yPosition -= 10;
            };

            const addField = (label, value) => {
                if (!value || value === 'N/A' || value === '') return;

                const text = `${label}: ${value}`;
                page.drawText(text, {
                    x: margin,
                    y: yPosition,
                    size: 10,
                    font: regularFont,
                    color: rgb(0, 0, 0),
                });
                yPosition -= 16;
            };

            // Title header with background
            page.drawRectangle({
                x: 0,
                y: height - 70,
                width: width,
                height: 70,
                color: rgb(0.12, 0.24, 0.45),
            });

            page.drawText('ANMC MEMBERSHIP FORM', {
                x: width / 2 - 150,
                y: height - 45,
                size: 20,
                font: boldFont,
                color: rgb(1, 1, 1),
            });

            yPosition = height - 100;

            // Reference Number
            addText(`Reference Number: ${memberData.referenceNo || 'N/A'}`, 12, true);
            yPosition -= 10;

            // Personal Information
            addSection('PERSONAL INFORMATION');
            addField('First Name', memberData.firstName);
            addField('Last Name', memberData.lastName);
            addField('Email', memberData.email);
            addField('Mobile', memberData.mobile);
            addField('Gender', memberData.gender);
            addField('Age', memberData.age);

            // Membership Details
            addSection('MEMBERSHIP DETAILS');
            addField('Category', memberData.membershipCategory);
            addField('Type', memberData.membershipType);
            addField('Membership Fee', memberData.membershipFee ? `$${memberData.membershipFee} AUD` : 'N/A');
            addField('Payment Type', memberData.paymentType);
            addField('Payment Status', memberData.paymentStatus);
            addField('Payment Date', memberData.paymentDate ? new Date(memberData.paymentDate).toLocaleDateString('en-AU') : 'N/A');
            addField('Membership Start Date', memberData.membershipStartDate ? new Date(memberData.membershipStartDate).toLocaleDateString('en-AU') : 'N/A');

            const expiryDateText = memberData.expiryDate
                ? new Date(memberData.expiryDate).toLocaleDateString('en-AU')
                : (memberData.membershipCategory === 'life' ? 'LIFETIME' : 'N/A');
            addField('Expiry Date', expiryDateText);
            addField('Renewals Count', memberData.renewalCount || '0');

            // Installment Details
            if (memberData.paymentType === 'installments') {
                addSection('INSTALLMENT PAYMENT DETAILS');
                addField('Upfront Payment', memberData.installmentAmount ? `$${memberData.installmentAmount} AUD` : 'N/A');
                addField('Remaining Balance', memberData.remainingBalance ? `$${memberData.remainingBalance} AUD` : 'N/A');
                addField('Direct Debit Account Name', memberData.directDebitAccountName);
                addField('BSB', memberData.directDebitBsb);
                addField('Account Number', memberData.directDebitAccountNumber);
                if (memberData.directDebitAuthorityAccepted) {
                    addField('Direct Debit Authority', 'Accepted');
                }
            }

            // Address
            addSection('RESIDENTIAL ADDRESS');
            if (memberData.residentialAddress) {
                addField('Street', memberData.residentialAddress.street);
                addField('Suburb', memberData.residentialAddress.suburb);
                addField('State', memberData.residentialAddress.state);
                addField('Postcode', memberData.residentialAddress.postcode);
                addField('Country', memberData.residentialAddress.country);
            }

            // Family Information
            addSection('FAMILY INFORMATION');
            addField('Primary Member', memberData.isPrimaryMember ? 'Yes' : 'No');
            if (memberData.linkedMemberReferenceNo) {
                addField('Linked To', memberData.linkedMemberReferenceNo);
                addField('Relationship', memberData.relationship);
            }

            // Family Members
            if (memberData.familyMembers && memberData.familyMembers.length > 0) {
                yPosition -= 10;
                addText('Linked Family Members:', 11, true);
                yPosition -= 5;

                memberData.familyMembers.forEach((fm) => {
                    const memberText = `${fm.referenceNo || 'N/A'} - ${fm.firstName} ${fm.lastName} (${fm.relationship || 'N/A'})`;
                    addField('', memberText);
                });
            }

            // Member Status
            addSection('MEMBER STATUS');
            addField('Status', memberData.status);
            addField('Badge Status', memberData.badgeTaken === 'yes' ? 'Taken' : 'Not Taken');
            if (memberData.approvedAt) {
                addField('Approved Date', new Date(memberData.approvedAt).toLocaleString('en-AU'));
                addField('Approved By', memberData.approvedBy);
            }
            if (memberData.createdAt) {
                addField('Registration Date', new Date(memberData.createdAt).toLocaleString('en-AU'));
            }

            // Footer
            page.drawText(`Generated: ${new Date().toLocaleString('en-AU')}`, {
                x: margin,
                y: 30,
                size: 8,
                font: regularFont,
                color: rgb(0.5, 0.5, 0.5),
            });

            page.drawText('Page 1 of 1', {
                x: width / 2 - 30,
                y: 30,
                size: 8,
                font: regularFont,
                color: rgb(0.5, 0.5, 0.5),
            });

            const pdfBytes = await pdfDoc.save();
            return Buffer.from(pdfBytes);
        } catch (error) {
            console.error('Error generating member details PDF:', error);
            throw new Error(`Failed to generate member details PDF: ${error.message}`);
        }
    }

    /**
     * Generate member details filename
     */
    getMemberDetailsFilename(memberData) {
        const { firstName, lastName, referenceNo } = memberData;
        const sanitizedName = `${firstName}_${lastName}`.replace(/[^a-zA-Z0-9_]/g, '_');
        const ref = referenceNo || 'MEMBER';
        return `Member_Details_${sanitizedName}_${ref}.pdf`;
    }
}

module.exports = new MemberDetailsPdfService();
