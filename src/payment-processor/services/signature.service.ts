import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

/**
 * Service responsible for generating payment signatures
 * Follows Single Responsibility Principle - only handles signature generation
 * Not coupled to any specific payment provider
 */
@Injectable()
export class SignatureService {
  
  /**
   * Generate SHA-256 signature for Wompi transactions
   * Format: reference + amount_in_cents + currency + integrity_key
   * 
   * @param reference - Transaction reference (checkout ID)
   * @param amountInCents - Amount in cents
   * @param currency - Currency code (e.g., 'COP')
   * @param integrityKey - Integrity key from payment provider
   * @returns SHA-256 hash in hexadecimal format
   */
  generateWompiSignature(
    reference: string,
    amountInCents: number,
    currency: string,
    integrityKey: string
  ): string {
    const concatenatedString = `${reference}${amountInCents}${currency}${integrityKey}`;
    
    return createHash('sha256')
      .update(concatenatedString)
      .digest('hex');
  }

  /**
   * Generic signature generation method
   * Can be extended for other payment providers
   * 
   * @param data - Data to hash
   * @param algorithm - Hashing algorithm (default: 'sha256')
   * @returns Hashed string in hexadecimal format
   */
  generateSignature(data: string, algorithm: string = 'sha256'): string {
    return createHash(algorithm)
      .update(data)
      .digest('hex');
  }

  /**
   * Validate if a signature matches expected data
   * 
   * @param data - Original data
   * @param signature - Signature to validate
   * @param algorithm - Hashing algorithm used
   * @returns True if signature is valid
   */
  validateSignature(data: string, signature: string, algorithm: string = 'sha256'): boolean {
    const expectedSignature = this.generateSignature(data, algorithm);
    return expectedSignature === signature;
  }
}