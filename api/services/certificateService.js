const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const s3Service = require('./s3Service');

class CertificateService {
    constructor() {
        // S3 keys for certificate templates
        this.templateKeys = {
            general: 'certificates/templates/ANMC Membership Certificate-general.pdf',
            life: 'certificates/templates/ANMC Membership Certificate-life.pdf'
        };
        console.log('🔍 Certificate template S3 keys:', this.templateKeys);

        // Text position configuration - ADJUST THESE VALUES TO MATCH YOUR TEMPLATE
        this.positions = {
            // Member name position (centered horizontally)
            nameY: 300,           // Distance from TOP of page (moved up by 100pts total)
            nameSize: 32,         // Font size for name

            // Details section
            detailsStartY: 280,   // Starting Y position for details (from top)
            detailsLeftMargin: 100,  // Left margin for details text
            detailsSize: 12,      // Font size for details
            detailsLineSpacing: 25,  // Space between detail lines

            // Reference number and issue date (centered)
            referenceNoY: 190,    // Distance from BOTTOM of page
            issueDateY: 170,      // Distance from BOTTOM of page
            expiryDateY: 150,     // Distance from BOTTOM of page (for general members)
            bottomTextSize: 10
        };
    }

    /**
     * Generate a membership certificate for a member
     * @param {Object} memberData - Member information
     * @returns {Promise<Buffer>} - PDF certificate as buffer
     */
    async generateMembershipCertificate(memberData) {
        try {
            const {
                firstName,
                lastName,
                membershipNumber,
                referenceNo,
                joinDate,
                membershipStartDate,
                membershipCategory,
                expiryDate
            } = memberData;

            console.log('📄 Generating certificate for:', firstName, lastName);
            console.log('📋 Membership category:', membershipCategory);

            // Determine which template to use based on membership category
            const templateType = membershipCategory === 'life' ? 'life' : 'general';
            const templateKey = this.templateKeys[templateType];

            console.log('📁 Template S3 key:', templateKey);

            // Fetch template from S3
            let templateBytes;
            try {
                const s3Object = await s3Service.getFile(templateKey);
                templateBytes = s3Object.Body;
                console.log('✅ Template loaded from S3, size:', templateBytes.length, 'bytes');
            } catch (err) {
                console.error('❌ Template file NOT found in S3:', templateKey);
                console.error('S3 Error:', err.message);
                throw new Error(`Certificate template not found in S3: ${templateKey}`);
            }

            const pdfDoc = await PDFDocument.load(templateBytes);
            console.log('✅ PDF document created');

            // Get the first page
            const pages = pdfDoc.getPages();
            console.log('📄 Total pages in template:', pages.length);

            const firstPage = pages[0];
            const { width, height } = firstPage.getSize();
            console.log('📐 Page dimensions:', width, 'x', height);

            // Check if template has content
            const pageCount = pdfDoc.getPageCount();
            console.log('📊 Template page count:', pageCount);
            console.log('🎨 Template is loaded and will be preserved with text overlay');

            // Embed fonts
            const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            // Full name
            const fullName = `${firstName || ''} ${lastName || ''}`.trim().toUpperCase();

            // Calculate positions using configured values
            // Member name - centered horizontally
            const nameWidth = boldFont.widthOfTextAtSize(fullName, this.positions.nameSize);
            const nameX = (width - nameWidth) / 2;
            const nameY = height - this.positions.nameY; // Convert from top to bottom coordinates

            console.log('📝 Drawing name:', fullName, 'at', nameX, nameY);
            console.log('📐 Page height:', height, 'Name Y (from bottom):', nameY);

            // Draw member name
            firstPage.drawText(fullName, {
                x: nameX,
                y: nameY,
                size: this.positions.nameSize,
                font: boldFont,
                color: rgb(0, 0, 0),
            });

            // Membership details - positioned below name
            const detailsStartY = height - this.positions.detailsStartY;
            let currentY = detailsStartY;

            console.log('📋 Details starting at Y:', currentY);

            // Membership Number
            if (membershipNumber) {
                firstPage.drawText(`Membership No: ${membershipNumber}`, {
                    x: this.positions.detailsLeftMargin,
                    y: currentY,
                    size: this.positions.detailsSize,
                    font: regularFont,
                    color: rgb(0, 0, 0),
                });
                currentY -= this.positions.detailsLineSpacing;
            }

            // Reference Number - centered at bottom
            if (referenceNo) {
                const refText = `Reference No: ${referenceNo}`;
                const refWidth = regularFont.widthOfTextAtSize(refText, this.positions.bottomTextSize);
                const refX = (width - refWidth) / 2;

                firstPage.drawText(refText, {
                    x: refX,
                    y: this.positions.referenceNoY,
                    size: this.positions.bottomTextSize,
                    font: regularFont,
                    color: rgb(0.4, 0.4, 0.4),
                });
            }

            // Issue Date (today) - centered at bottom
            const issueDate = new Date().toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const issueDateText = `Issued: ${issueDate}`;
            const issueDateWidth = regularFont.widthOfTextAtSize(issueDateText, this.positions.bottomTextSize);
            const issueDateX = (width - issueDateWidth) / 2;

            firstPage.drawText(issueDateText, {
                x: issueDateX,
                y: this.positions.issueDateY,
                size: this.positions.bottomTextSize,
                font: regularFont,
                color: rgb(0.4, 0.4, 0.4),
            });

            // Expiry Date - centered at bottom (only for general members)
            if (membershipCategory === 'general' && expiryDate) {
                const formattedExpiryDate = new Date(expiryDate).toLocaleDateString('en-AU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                const expiryText = `Valid Until: ${formattedExpiryDate}`;
                const expiryWidth = regularFont.widthOfTextAtSize(expiryText, this.positions.bottomTextSize);
                const expiryX = (width - expiryWidth) / 2;

                firstPage.drawText(expiryText, {
                    x: expiryX,
                    y: this.positions.expiryDateY,
                    size: this.positions.bottomTextSize,
                    font: regularFont,
                    color: rgb(0.4, 0.4, 0.4),
                });
            }

            console.log('✅ All text added to certificate');

            // Save the PDF with the template and overlaid text
            const pdfBytes = await pdfDoc.save();
            console.log('✅ Certificate generated, size:', pdfBytes.length, 'bytes');

            return Buffer.from(pdfBytes);
        } catch (error) {
            console.error('❌ Error generating certificate:', error);
            throw new Error(`Failed to generate certificate: ${error.message}`);
        }
    }

    /**
     * Generate certificate filename
     */
    getCertificateFilename(memberData) {
        const { firstName, lastName, membershipNumber } = memberData;
        const sanitizedName = `${firstName}_${lastName}`.replace(/[^a-zA-Z0-9_]/g, '_');
        const number = membershipNumber || 'MEMBER';
        return `ANMC_Certificate_${sanitizedName}_${number}.pdf`;
    }
}

module.exports = new CertificateService();
