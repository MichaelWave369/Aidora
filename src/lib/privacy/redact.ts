const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const phonePattern = /(\+?\d[\d\s().-]{7,}\d)/g;
const addressPattern = /\b\d{1,5}\s+[A-Za-z0-9\s]{2,}(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/gi;

export function redactPII(input: string): string {
  return input
    .replace(emailPattern, '[redacted-email]')
    .replace(phonePattern, '[redacted-phone]')
    .replace(addressPattern, '[redacted-address]');
}
