import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { config } from '../config/index.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function key(): Buffer {
  if (!config.googleBusiness.tokenEncryptionKey) {
    throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY is not configured');
  }
  const value = Buffer.from(config.googleBusiness.tokenEncryptionKey, 'base64');
  if (value.length !== 32) throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY must be a base64 encoded 32-byte key');
  return value;
}

export function encryptSecret(value: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join('.');
}

export function decryptSecret(value: string): string {
  const [ivEncoded, tagEncoded, encryptedEncoded] = value.split('.');
  if (!ivEncoded || !tagEncoded || !encryptedEncoded) throw new Error('Invalid encrypted secret');
  const decipher = createDecipheriv(ALGORITHM, key(), Buffer.from(ivEncoded, 'base64'));
  decipher.setAuthTag(Buffer.from(tagEncoded, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedEncoded, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}