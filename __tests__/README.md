# Test Suite for n8n-nodes-netsuite-oauth1

This directory contains comprehensive Jest tests for the NetSuite OAuth1 n8n node.

## Test Files

### 1. `credentials.test.ts`
Tests for the NetSuite OAuth1 credentials structure:
- Validates all 8 required credential fields
- Ensures realm field includes underscore guidance
- Verifies password fields are properly secured
- Tests credential metadata and configuration

### 2. `oauth-signature.test.ts`
Tests for OAuth1 signature generation and validation:
- Verifies HMAC-SHA256 signature calculation
- Tests realm parameter handling (underscores vs hyphens)
- Validates OAuth header format
- Ensures all required OAuth parameters are included
- Tests signature consistency and correctness

### 3. `realm-transformation.test.ts`
Tests for realm parameter transformation:
- Verifies hyphen-to-underscore conversion
- Tests production and sandbox account formats
- Covers edge cases and error scenarios
- Validates idempotence and type safety
- Performance tests for large-scale transformations

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Coverage Thresholds

The test suite maintains minimum coverage thresholds:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## What These Tests Prove

1. **Credential Validation**: All required fields are properly configured with correct types and security settings

2. **OAuth Signature Correctness**: The OAuth1 signature is correctly generated using HMAC-SHA256, matching NetSuite's requirements

3. **Realm Parameter Handling**: The critical underscore requirement for NetSuite account IDs is enforced:
   - Production: `1234567`
   - Sandbox: `1234567_SB1` (NOT `1234567-SB1`)

4. **Error Prevention**: Defensive code automatically converts hyphens to underscores, preventing common user errors

5. **Security**: Sensitive fields (Consumer Secret, Token Secret) are properly marked as password fields

## CI/CD Integration

These tests are automatically run on every commit via GitHub Actions. See `.github/workflows/test.yml` for the CI configuration.
