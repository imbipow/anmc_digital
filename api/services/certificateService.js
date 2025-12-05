const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

class CertificateService {
    constructor() {
        // Build absolute path to template
        // __dirname is api/services, so we go up 2 levels to project root, then into public
        this.templatePath = path.resolve(__dirname, '..', '..', 'public', 'anmc-certificate-template.pdf');
        console.log('🔍 Certificate template path:', this.templatePath);

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

            // Issue date
            issueDateY: 150,      // Distance from BOTTOM of page (moved up by 100pts)
            issueDateSize: 10
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
                joinDate
            } = memberData;

            console.log('📄 Generating certificate for:', firstName, lastName);
            console.log('📁 Template path:', this.templatePath);

            // Check if template exists
            try {
                await fs.access(this.templatePath);
                console.log('✅ Template file exists');
            } catch (err) {
                console.error('❌ Template file NOT found at:', this.templatePath);
                throw new Error(`Certificate template not found at: ${this.templatePath}`);
            }

            // Load the template PDF
            const templateBytes = await fs.readFile(this.templatePath);
            console.log('✅ Template loaded, size:', templateBytes.length, 'bytes');

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

            // Join Date
            if (joinDate) {
                const formattedJoinDate = new Date(joinDate).toLocaleDateString('en-AU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                firstPage.drawText(`Member Since: ${formattedJoinDate}`, {
                    x: this.positions.detailsLeftMargin,
                    y: currentY,
                    size: this.positions.detailsSize,
                    font: regularFont,
                    color: rgb(0, 0, 0),
                });
                currentY -= this.positions.detailsLineSpacing;
            }

            // Reference Number - above issue date
            if (referenceNo) {
                firstPage.drawText(`Reference No: ${referenceNo}`, {
                    x: this.positions.detailsLeftMargin,
                    y: this.positions.issueDateY + 20, // 20pts above issue date
                    size: this.positions.issueDateSize,
                    font: regularFont,
                    color: rgb(0.4, 0.4, 0.4),
                });
            }

            // Issue Date (today) - smaller, lighter text at bottom
            const issueDate = new Date().toLocaleDateString('en-AU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            firstPage.drawText(`Issued: ${issueDate}`, {
                x: this.positions.detailsLeftMargin,
                y: this.positions.issueDateY,
                size: this.positions.issueDateSize,
                font: regularFont,
                color: rgb(0.4, 0.4, 0.4),
            });

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
