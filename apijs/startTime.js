// Function to get today's start time (midnight)
export function getTodayStartTime() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight
    return Math.floor(today.getTime() / 1000); // Convert to Unix timestamp
}