export function getEndingDate(plusDay){
    // Get current date
    const currentDate = new Date();

    // Add 30 days
    currentDate.setDate(currentDate.getDate() + plusDay);

    // Extract year, month, and day
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
    const day = String(currentDate.getDate()).padStart(2, '0');

    // Combine into desired format (e.g., YYYY-MM-DD)
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}