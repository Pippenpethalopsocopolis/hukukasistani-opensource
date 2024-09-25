export function getRandom6DigitNumber() {
    const max = 999999; // Maximum 6-digit number
    const min = 100000; // Minimum 6-digit number
    const range = max - min + 1;

    // Determine the number of bytes needed to represent the range
    const bitsNeeded = Math.ceil(Math.log2(range));
    const bytesNeeded = Math.ceil(bitsNeeded / 8);

    // Generate random bytes
    const randomBytes = crypto.randomBytes(bytesNeeded);

    // Convert bytes to an integer within the desired range
    const randomValue = randomBytes.readUIntBE(0, bytesNeeded);

    // Ensure the generated number falls within the specified range
    return min + randomValue % range;
}