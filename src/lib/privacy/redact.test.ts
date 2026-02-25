import { describe, expect, it } from 'vitest';
import { redactPII } from './redact';

describe('redact', () => {
  it('strips pii patterns', () => {
    const output = redactPII('email me a@test.com call +1 555 555 1212 at 123 Main Street');
    expect(output).toContain('[redacted-email]');
    expect(output).toContain('[redacted-phone]');
    expect(output).toContain('[redacted-address]');
  });
});
