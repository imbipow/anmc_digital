/**
 * Australian Phone Number Validation Utility
 *
 * Supports the following formats:
 * - Mobile: 04XX XXX XXX, +61 4XX XXX XXX, 614XXXXXXXX
 * - Landline: 0X XXXX XXXX, +61 X XXXX XXXX
 */

/**
 * Validates Australian phone numbers (mobile and landline)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid Australian phone number
 */
export const isValidAustralianPhone = (phone) => {
    if (!phone) return false;

    // Remove all spaces, dashes, and parentheses
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Australian mobile pattern: starts with 04 or +614 or 614
    const mobilePattern = /^(?:\+?61|0)4\d{8}$/;

    // Australian landline pattern: starts with 0X (X=2,3,7,8) or +61X or 61X
    const landlinePattern = /^(?:\+?61|0)[2378]\d{8}$/;

    return mobilePattern.test(cleaned) || landlinePattern.test(cleaned);
};

/**
 * Formats Australian phone number to standard format
 * @param {string} phone - Phone number to format
 * @returns {string} - Formatted phone number
 */
export const formatAustralianPhone = (phone) => {
    if (!phone) return '';

    // Remove all spaces, dashes, and parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Remove leading + if present
    const hasPlus = cleaned.startsWith('+');
    if (hasPlus) {
        cleaned = cleaned.substring(1);
    }

    // Convert 61 prefix to 0
    if (cleaned.startsWith('61')) {
        cleaned = '0' + cleaned.substring(2);
    }

    // Format based on type
    if (cleaned.startsWith('04') && cleaned.length === 10) {
        // Mobile: 04XX XXX XXX
        return cleaned.replace(/^(\d{4})(\d{3})(\d{3})$/, '$1 $2 $3');
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
        // Landline: 0X XXXX XXXX
        return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '$1 $2 $3');
    }

    return phone; // Return original if format not recognized
};

/**
 * Normalizes Australian phone number to E.164 format (+61...)
 * @param {string} phone - Phone number to normalize
 * @returns {string} - Normalized phone number in E.164 format
 */
export const normalizeAustralianPhone = (phone) => {
    if (!phone) return '';

    // Remove all spaces, dashes, and parentheses
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');

    // Remove leading +
    if (cleaned.startsWith('+')) {
        cleaned = cleaned.substring(1);
    }

    // Already in 61 format
    if (cleaned.startsWith('61')) {
        return '+' + cleaned;
    }

    // Convert 0 prefix to +61
    if (cleaned.startsWith('0')) {
        return '+61' + cleaned.substring(1);
    }

    return phone; // Return original if format not recognized
};

/**
 * Get validation error message for Australian phone
 * @param {string} phone - Phone number to validate
 * @returns {string} - Error message or empty string if valid
 */
export const getPhoneValidationError = (phone) => {
    if (!phone || phone.trim() === '') {
        return 'Phone number is required';
    }

    if (!isValidAustralianPhone(phone)) {
        return 'Please enter a valid Australian phone number (e.g., 04XX XXX XXX or 0X XXXX XXXX)';
    }

    return '';
};
