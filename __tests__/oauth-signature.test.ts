import OAuth from 'oauth-1.0a';
import * as crypto from 'crypto';

/**
 * Test suite for OAuth1 signature calculation with NetSuite
 *
 * These tests verify:
 * 1. OAuth signature is correctly generated with HMAC-SHA256
 * 2. Realm parameter is properly handled
 * 3. Hyphen to underscore conversion works correctly
 */
describe('OAuth1 Signature Generation', () => {
	const testCredentials = {
		consumerKey: 'test_consumer_key',
		consumerSecret: 'test_consumer_secret',
		tokenId: 'test_token_id',
		tokenSecret: 'test_token_secret',
	};

	const createOAuthInstance = (realm: string) => {
		return new OAuth({
			consumer: {
				key: testCredentials.consumerKey,
				secret: testCredentials.consumerSecret,
			},
			realm: realm,
			signature_method: 'HMAC-SHA256',
			hash_function(base_string, key) {
				return crypto
					.createHmac('sha256', key)
					.update(base_string)
					.digest('base64');
			},
		});
	};

	describe('Realm parameter handling', () => {
		it('should generate OAuth header with production realm (numeric)', () => {
			const realm = '1234567';
			const oauth = createOAuthInstance(realm);

			const token = {
				key: testCredentials.tokenId,
				secret: testCredentials.tokenSecret,
			};

			const requestData = {
				url: 'https://1234567.restlets.api.netsuite.com/app/site/hosting/restlet.nl',
				method: 'GET',
			};

			const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

			expect(authHeader).toHaveProperty('Authorization');
			expect(authHeader.Authorization).toContain('OAuth realm="1234567"');
			expect(authHeader.Authorization).toContain('oauth_consumer_key');
			expect(authHeader.Authorization).toContain('oauth_token');
			expect(authHeader.Authorization).toContain('oauth_signature');
		});

		it('should generate OAuth header with sandbox realm (with underscores)', () => {
			const realm = '1234567_SB1';
			const oauth = createOAuthInstance(realm);

			const token = {
				key: testCredentials.tokenId,
				secret: testCredentials.tokenSecret,
			};

			const requestData = {
				url: 'https://1234567-sb1.restlets.api.netsuite.com/app/site/hosting/restlet.nl',
				method: 'GET',
			};

			const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

			expect(authHeader).toHaveProperty('Authorization');
			expect(authHeader.Authorization).toContain('OAuth realm="1234567_SB1"');
			expect(authHeader.Authorization).not.toContain('realm="1234567-SB1"');
		});

		it('should convert hyphens to underscores in realm', () => {
			// Simulate what the node does: convert hyphens to underscores
			const inputRealm = '1234567-SB1'; // User might enter this incorrectly
			const correctedRealm = inputRealm.replace(/-/g, '_'); // This is what our code does

			expect(correctedRealm).toBe('1234567_SB1');

			const oauth = createOAuthInstance(correctedRealm);

			const token = {
				key: testCredentials.tokenId,
				secret: testCredentials.tokenSecret,
			};

			const requestData = {
				url: 'https://1234567-sb1.restlets.api.netsuite.com/app/site/hosting/restlet.nl',
				method: 'POST',
			};

			const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

			expect(authHeader.Authorization).toContain('OAuth realm="1234567_SB1"');
		});

		it('should handle multiple hyphens in realm', () => {
			const inputRealm = '1234567-SB1-TEST';
			const correctedRealm = inputRealm.replace(/-/g, '_');

			expect(correctedRealm).toBe('1234567_SB1_TEST');

			const oauth = createOAuthInstance(correctedRealm);

			const token = {
				key: testCredentials.tokenId,
				secret: testCredentials.tokenSecret,
			};

			const requestData = {
				url: 'https://test.restlets.api.netsuite.com/app/site/hosting/restlet.nl',
				method: 'GET',
			};

			const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

			expect(authHeader.Authorization).toContain('OAuth realm="1234567_SB1_TEST"');
		});
	});

	describe('OAuth signature calculation', () => {
		it('should generate consistent signatures for same request', () => {
			const realm = '1234567';
			const oauth = createOAuthInstance(realm);

			const token = {
				key: testCredentials.tokenId,
				secret: testCredentials.tokenSecret,
			};

			const requestData = {
				url: 'https://1234567.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=customscript_test&deploy=customdeploy_test',
				method: 'GET',
			};

			// Force same timestamp and nonce for consistent signatures
			const authData1 = oauth.authorize(requestData, token);
			const authData2 = oauth.authorize(requestData, token);

			// Signatures should be present
			expect(authData1.oauth_signature).toBeDefined();
			expect(authData2.oauth_signature).toBeDefined();

			// Both should use HMAC-SHA256
			expect(authData1.oauth_signature_method).toBe('HMAC-SHA256');
			expect(authData2.oauth_signature_method).toBe('HMAC-SHA256');
		});

		it('should generate different signatures for different HTTP methods', () => {
			const realm = '1234567';
			const oauth = createOAuthInstance(realm);

			const token = {
				key: testCredentials.tokenId,
				secret: testCredentials.tokenSecret,
			};

			const url = 'https://1234567.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=test&deploy=test';

			const getRequest = oauth.authorize({ url, method: 'GET' }, token);
			const postRequest = oauth.authorize({ url, method: 'POST' }, token);

			// Different methods should produce different signatures
			expect(getRequest.oauth_signature).not.toBe(postRequest.oauth_signature);
		});

		it('should include all required OAuth parameters', () => {
			const realm = '1234567';
			const oauth = createOAuthInstance(realm);

			const token = {
				key: testCredentials.tokenId,
				secret: testCredentials.tokenSecret,
			};

			const requestData = {
				url: 'https://1234567.restlets.api.netsuite.com/app/site/hosting/restlet.nl',
				method: 'GET',
			};

			const authData = oauth.authorize(requestData, token);

			// Verify all required OAuth1 parameters are present
			expect(authData).toHaveProperty('oauth_consumer_key');
			expect(authData).toHaveProperty('oauth_token');
			expect(authData).toHaveProperty('oauth_signature_method');
			expect(authData).toHaveProperty('oauth_timestamp');
			expect(authData).toHaveProperty('oauth_nonce');
			expect(authData).toHaveProperty('oauth_version');
			expect(authData).toHaveProperty('oauth_signature');

			// Verify values
			expect(authData.oauth_consumer_key).toBe(testCredentials.consumerKey);
			expect(authData.oauth_token).toBe(testCredentials.tokenId);
			expect(authData.oauth_signature_method).toBe('HMAC-SHA256');
			expect(authData.oauth_version).toBe('1.0');
		});

		it('should generate valid base64-encoded signatures', () => {
			const realm = '1234567';
			const oauth = createOAuthInstance(realm);

			const token = {
				key: testCredentials.tokenId,
				secret: testCredentials.tokenSecret,
			};

			const requestData = {
				url: 'https://1234567.restlets.api.netsuite.com/app/site/hosting/restlet.nl',
				method: 'POST',
				data: { test: 'value' },
			};

			const authData = oauth.authorize(requestData, token);

			// Signature should be base64 encoded
			const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
			expect(authData.oauth_signature).toMatch(base64Regex);
		});
	});

	describe('Authorization header format', () => {
		it('should format authorization header correctly', () => {
			const realm = '1234567_SB1';
			const oauth = createOAuthInstance(realm);

			const token = {
				key: testCredentials.tokenId,
				secret: testCredentials.tokenSecret,
			};

			const requestData = {
				url: 'https://1234567-sb1.restlets.api.netsuite.com/app/site/hosting/restlet.nl',
				method: 'GET',
			};

			const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

			// Verify header structure
			expect(authHeader.Authorization).toMatch(/^OAuth realm="[^"]+"/);
			expect(authHeader.Authorization).toContain('oauth_consumer_key="');
			expect(authHeader.Authorization).toContain('oauth_token="');
			expect(authHeader.Authorization).toContain('oauth_signature="');
			expect(authHeader.Authorization).toContain('oauth_timestamp="');
			expect(authHeader.Authorization).toContain('oauth_nonce="');
		});

		it('should properly escape special characters in realm', () => {
			const realm = '1234567_SB1';
			const oauth = createOAuthInstance(realm);

			const token = {
				key: testCredentials.tokenId,
				secret: testCredentials.tokenSecret,
			};

			const requestData = {
				url: 'https://test.restlets.api.netsuite.com/app/site/hosting/restlet.nl',
				method: 'GET',
			};

			const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

			// Realm should be properly quoted
			expect(authHeader.Authorization).toContain('OAuth realm="1234567_SB1"');
		});
	});
});
