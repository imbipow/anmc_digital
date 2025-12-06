const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs').promises;
const cognitoService = require('../services/cognitoService');
const membersService = require('../services/membersService');

/**
 * Format phone number to E.164 format (+61...)
 * Handles various formats: (+61) 4 3372 5749, 430754455, 0430754455
 */
function formatPhoneNumber(phone) {
    if (!phone) return null;

    // Convert to string and remove all spaces, parentheses, and hyphens
    let cleaned = String(phone).replace(/[\s\(\)\-]/g, '');

    // Remove any leading + or 0
    cleaned = cleaned.replace(/^\+?0*/, '');

    // If it doesn't start with 61, add it
    if (!cleaned.startsWith('61')) {
        // Australian mobile numbers start with 4
        if (cleaned.startsWith('4')) {
            cleaned = '61' + cleaned;
        }
    }

    // Add the + prefix
    return '+' + cleaned;
}

/**
 * Generate a dummy email if email is empty
 */
function generateDummyEmail(memberNo, firstName, lastName) {
    const sanitizedFirst = (firstName || 'member').toLowerCase().replace(/[^a-z0-9]/g, '');
    const sanitizedLast = (lastName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const sanitizedMemberNo = String(memberNo || Date.now()).replace(/[^a-z0-9]/g, '');

    if (sanitizedLast) {
        return `${sanitizedFirst}.${sanitizedLast}.${sanitizedMemberNo}@anmcinc.dummy`;
    }
    return `${sanitizedFirst}.${sanitizedMemberNo}@anmcinc.dummy`;
}

/**
 * Generate a secure random password that meets Cognito password policy
 * 10 characters total: 2 uppercase, 4 lowercase, 2 numbers, 2 symbols
 */
function generatePassword() {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%&'; // Excluding ^ and * as requested

    let password = '';

    // Add exactly 2 uppercase letters
    for (let i = 0; i < 2; i++) {
        password += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    }

    // Add exactly 4 lowercase letters
    for (let i = 0; i < 4; i++) {
        password += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    }

    // Add exactly 2 numbers
    for (let i = 0; i < 2; i++) {
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }

    // Add exactly 2 unique symbols (no repeats)
    const usedSymbols = [];
    while (usedSymbols.length < 2) {
        const symbol = symbols.charAt(Math.floor(Math.random() * symbols.length));
        if (!usedSymbols.includes(symbol)) {
            usedSymbols.push(symbol);
            password += symbol;
        }
    }

    // Convert to array and shuffle using Fisher-Yates
    const chars = password.split('');
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = chars[i];
        chars[i] = chars[j];
        chars[j] = temp;
    }

    const finalPassword = chars.join('');

    // Verify password meets ALL requirements (safety check)
    const hasUpper = /[A-Z]/.test(finalPassword);
    const hasLower = /[a-z]/.test(finalPassword);
    const hasNumber = /[0-9]/.test(finalPassword);
    const hasSymbol = /[!@#$%^&*]/.test(finalPassword);
    const hasCorrectLength = finalPassword.length === 10;

    // Debug logging
    console.log('🔐 Generated password details:', {
        password: finalPassword,
        length: finalPassword.length,
        hasUpper,
        hasLower,
        hasNumber,
        hasSymbol,
        hasCorrectLength,
        upperCount: (finalPassword.match(/[A-Z]/g) || []).length,
        lowerCount: (finalPassword.match(/[a-z]/g) || []).length,
        numberCount: (finalPassword.match(/[0-9]/g) || []).length,
        symbolCount: (finalPassword.match(/[!@#$%^&*]/g) || []).length
    });

    if (!hasUpper || !hasLower || !hasNumber || !hasSymbol || !hasCorrectLength) {
        console.error('⚠️  Password validation failed - regenerating...');
        // Try one more time recursively
        return generatePassword();
    }

    return finalPassword;
}

/**
 * Parse name into first name and last name
 * Last name is everything before the first space, first name is the rest
 */
function parseName(fullName) {
    if (!fullName) return { firstName: '', lastName: '' };

    const trimmed = String(fullName).trim();
    const spaceIndex = trimmed.indexOf(' ');

    if (spaceIndex === -1) {
        // No space, treat entire name as first name
        return { firstName: trimmed, lastName: '' };
    }

    // firstname name is before the first space
    const firstName= trimmed.substring(0, spaceIndex).trim();
    // last name is after the first space
    const  lastName = trimmed.substring(spaceIndex + 1).trim();

    return { firstName, lastName };
}

// sendWelcomeNotifications function removed - Cognito now handles email delivery
// For real emails: Cognito sends welcome email with auto-generated password
// For dummy emails: No Cognito account created, member must get real email from admin first

/**
 * Main import function
 */
async function importMembers() {
    const filePath = path.resolve(__dirname, '..', '..', 'public', 'Anmc_member_list.xlsx');

    console.log('📋 Starting member import...');
    console.log('📁 File path:', filePath);

    try {
        // Check if file exists
        await fs.access(filePath);
        console.log('✅ File found');
    } catch (error) {
        console.error('❌ File not found:', filePath);
        process.exit(1);
    }

    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    // sheet_to_json automatically uses first row as headers and skips it
    const data = XLSX.utils.sheet_to_json(worksheet, {
        raw: false, // Don't parse dates/numbers, keep as strings
        defval: '' // Default value for empty cells
    });

    console.log(`📊 Found ${data.length} data rows to process (header row automatically skipped)`);

    const results = {
        success: [],
        failed: [],
        skipped: []
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        console.log(`\n🔄 Processing row ${i + 1}/${data.length}...`);

        try {
            // Extract data from columns
            const memberNo = row['Member No'] || row['MemberNo'] || row['member_no'];
            const fullName = row['Name'] || row['name'];
            const suburb = row['Suburb'] || row['suburb'];
            const street = row.__EMPTY || row['Address'] || row['Street']; // Column 1 (unnamed)
            const emailRaw = row['ContactEmail'] || row['Email'] || row['email'] || row['contact_email'];
            const phoneRaw = row['Mobile'] || row['Phone'] || row['mobile'] || row['phone'];

            // Skip if no member number
            if (!memberNo) {
                console.log('⏭️  Skipping row - no member number');
                results.skipped.push({ row: i + 1, reason: 'No member number' });
                continue;
            }

            // Parse name
            const { firstName, lastName } = parseName(fullName);

            if (!firstName) {
                console.log('⏭️  Skipping row - no name');
                results.skipped.push({ row: i + 1, memberNo, reason: 'No name' });
                continue;
            }

            // Format phone number
            const mobile = phoneRaw ? formatPhoneNumber(phoneRaw) : null;

            // Generate or use email
            const email = emailRaw || generateDummyEmail(memberNo, firstName, lastName);
            const isDummyEmail = !emailRaw;

            // Generate password
            const password = generatePassword();

            console.log(`👤 Member: ${firstName} ${lastName}`);
            console.log(`📧 Email: ${email}${isDummyEmail ? ' (dummy)' : ''}`);
            console.log(`📱 Mobile: ${mobile || 'N/A'}`);
            console.log(`🏠 Address: ${street || ''}, ${suburb || ''}`);

            // Create member data object (without cognitoUserId initially)
            const memberData = {
                referenceNo: String(memberNo),
                firstName: firstName,
                lastName: lastName || '',
                email: email,
                mobile: mobile || '',
                membershipCategory: 'life',
                membershipType: 'single',
                residentialAddress: {
                    street: street || '',
                    suburb: suburb || '',
                    state: '',
                    postcode: '',
                    country: 'Australia'
                },
                gender: '',
                age: '',
                joinDate: new Date().toISOString(),
                membershipStartDate: new Date().toISOString(),
                expiryDate: null, // Life members don't expire
                status: 'active', // Set as active directly
                paymentStatus: 'paid',
                paymentType: 'import',
                membershipFee: 0,
                comments: 'Imported from Excel',
                isPrimaryMember: true
            };

            // Create member record in database FIRST
            // This way if it fails, we don't create orphaned Cognito users
            console.log('💾 Creating member record...');
            const member = await membersService.create(memberData);
            console.log('✅ Member record created with ID:', member.id);

            // Only create Cognito user for real email addresses
            // Skip Cognito creation for dummy emails
            if (!isDummyEmail) {
                console.log('🔐 Creating Cognito user...');

                // Let Cognito generate password and send email
                const cognitoResult = await cognitoService.createUser({
                    email: email,
                    password: password, // Will be ignored since sendCognitoEmail = true
                    firstName: firstName,
                    lastName: lastName || '',
                    phone: mobile,
                    suburb: suburb, // For address attribute
                    membershipType: 'single',
                    membershipCategory: 'life'
                }, true, 'member', true, true); // enabledByDefault = true, userType = 'member', forcePasswordReset = true, sendCognitoEmail = true

                console.log('✅ Cognito user created:', cognitoResult.username);

                // Update member record with Cognito user ID
                await membersService.update(member.id, { cognitoUserId: cognitoResult.userSub });
                console.log('✅ Member record updated with Cognito user ID');
                console.log('✅ Cognito welcome email sent to: ' + email);
            } else {
                console.log('⏭️  Skipping Cognito user creation for dummy email: ' + email);
                console.log('ℹ️  Member can only access the system after admin assigns a real email');
            }

            results.success.push({
                row: i + 1,
                memberNo: memberNo,
                name: `${firstName} ${lastName}`,
                email: email,
                mobile: mobile,
                isDummyEmail: isDummyEmail
            });

            console.log('✅ Successfully imported member');

        } catch (error) {
            console.error('❌ Error processing row:', error.message);
            results.failed.push({
                row: i + 1,
                memberNo: row['Member No'] || 'Unknown',
                error: error.message
            });
        }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully imported: ${results.success.length}`);
    console.log(`❌ Failed: ${results.failed.length}`);
    console.log(`⏭️  Skipped: ${results.skipped.length}`);

    if (results.failed.length > 0) {
        console.log('\n❌ Failed imports:');
        results.failed.forEach(f => {
            console.log(`   Row ${f.row} (Member ${f.memberNo}): ${f.error}`);
        });
    }

    if (results.skipped.length > 0) {
        console.log('\n⏭️  Skipped rows:');
        results.skipped.forEach(s => {
            console.log(`   Row ${s.row}: ${s.reason}`);
        });
    }

    console.log('\n✅ Import completed!');
}

// Run the import
if (require.main === module) {
    importMembers()
        .then(() => {
            console.log('✅ Script completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Script failed:', error);
            process.exit(1);
        });
}

module.exports = { importMembers };
