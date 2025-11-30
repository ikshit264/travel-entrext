import crypto from 'crypto';

// Use a strong encryption key from environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-32-char-key-change-this!'; // Must be 32 characters
const ALGORITHM = 'aes-256-cbc';

// Ensure the key is exactly 32 bytes
const getKey = () => {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
  return key;
};

/**
 * Encrypts the Gemini API key
 * @param apiKey - The plain text API key
 * @returns Encrypted string in format: iv:encryptedData
 */
export function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return IV and encrypted data separated by colon
  return `${iv.toString('hex')}:${encrypted}`;
}

/**
 * Decrypts the Gemini API key
 * @param encryptedData - The encrypted string in format: iv:encryptedData
 * @returns Decrypted API key
 */
export function decryptApiKey(encryptedData: string): string {
  try {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    throw new Error('Invalid or corrupted API key');
  }
}

/**
 * Validates if a Gemini API key format is correct
 * @param apiKey - The API key to validate
 * @returns boolean indicating if the key format is valid
 */
export function validateGeminiKeyFormat(apiKey: string): boolean {
  // Gemini API keys typically start with "AIza" and are around 39 characters
  return /^AIza[A-Za-z0-9_-]{35}$/.test(apiKey);
}
