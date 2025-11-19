/**
 * Converts 24-hour time format to 12-hour format with AM/PM
 * @param {string} time24 - Time in 24-hour format (e.g., "14:00", "09:30")
 * @returns {string} Time in 12-hour format (e.g., "2:00 PM", "9:30 AM")
 */
export const formatTimeTo12Hour = (time24) => {
    if (!time24) return '';

    // Handle if it's already in 12-hour format or has AM/PM
    if (time24.toLowerCase().includes('am') || time24.toLowerCase().includes('pm')) {
        return time24;
    }

    const [hours, minutes] = time24.split(':');
    let hour = parseInt(hours, 10);
    const minute = minutes || '00';

    if (isNaN(hour)) return time24;

    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12; // Convert 0 to 12 for midnight

    return `${hour}:${minute} ${period}`;
};

/**
 * Formats a time range from start to end time
 * @param {string} startTime - Start time (e.g., "10:00", "14:30")
 * @param {string} endTime - End time (e.g., "16:00", "20:00")
 * @returns {string} Formatted time range (e.g., "10:00 AM to 4:00 PM")
 */
export const formatTimeRange = (startTime, endTime) => {
    if (!startTime && !endTime) return '';

    if (startTime && !endTime) {
        return formatTimeTo12Hour(startTime);
    }

    if (!startTime && endTime) {
        return `Until ${formatTimeTo12Hour(endTime)}`;
    }

    const formattedStart = formatTimeTo12Hour(startTime);
    const formattedEnd = formatTimeTo12Hour(endTime);

    return `${formattedStart} to ${formattedEnd}`;
};

/**
 * Extracts and formats time from event object
 * @param {Object} event - Event object with time, startTime, endTime fields
 * @returns {string} Formatted time string
 */
export const getEventTimeDisplay = (event) => {
    // If there's a pre-formatted time field, try to use it
    if (event.time) {
        // Check if it already contains 'to' or '-' (range indicator)
        if (event.time.includes(' to ') || event.time.includes(' - ')) {
            const parts = event.time.split(/ to | - /);
            if (parts.length === 2) {
                return formatTimeRange(parts[0].trim(), parts[1].trim());
            }
        }
        return formatTimeTo12Hour(event.time);
    }

    // Otherwise use startTime and endTime
    return formatTimeRange(event.startTime, event.endTime);
};
