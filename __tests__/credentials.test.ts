import { NetsuiteOAuth1Api } from '../credentials/NetsuiteOAuth1Api.credentials';

/**
 * Test suite for NetSuite OAuth1 credentials
 *
 * These tests verify:
 * 1. Credential structure is valid
 * 2. All required fields are present
 * 3. Field properties are correctly configured
 */
describe('NetSuite OAuth1 Credentials', () => {
	let credentials: NetsuiteOAuth1Api;

	beforeEach(() => {
		credentials = new NetsuiteOAuth1Api();
	});

	describe('Credential metadata', () => {
		it('should have correct name', () => {
			expect(credentials.name).toBe('netsuiteOAuth1Api');
		});

		it('should have correct display name', () => {
			expect(credentials.displayName).toBe('Netsuite OAuth1 API');
		});

		it('should have documentation URL', () => {
			expect(credentials.documentationUrl).toBeDefined();
			expect(credentials.documentationUrl).toContain('oracle.com');
		});
	});

	describe('Credential properties', () => {
		it('should have all 8 required properties', () => {
			expect(credentials.properties).toHaveLength(8);
		});

		it('should have Account ID field', () => {
			const accountIdField = credentials.properties.find(p => p.name === 'accountId');

			expect(accountIdField).toBeDefined();
			expect(accountIdField?.displayName).toBe('Account ID');
			expect(accountIdField?.type).toBe('string');
			expect(accountIdField?.required).toBe(true);
			expect(accountIdField?.placeholder).toBe('TSTDRV1234567');
		});

		it('should have Realm field with underscore guidance', () => {
			const realmField = credentials.properties.find(p => p.name === 'realm');

			expect(realmField).toBeDefined();
			expect(realmField?.displayName).toBe('Realm');
			expect(realmField?.type).toBe('string');
			expect(realmField?.required).toBe(true);
			expect(realmField?.placeholder).toBe('1234567_SB1');
			expect(realmField?.description).toContain('underscore');
			expect(realmField?.description).toContain('1234567_SB1');
			expect(realmField?.description).not.toContain('numeric only');
		});

		it('should have Consumer Key field', () => {
			const consumerKeyField = credentials.properties.find(p => p.name === 'consumerKey');

			expect(consumerKeyField).toBeDefined();
			expect(consumerKeyField?.displayName).toBe('Consumer Key');
			expect(consumerKeyField?.type).toBe('string');
			expect(consumerKeyField?.required).toBe(true);
		});

		it('should have Consumer Secret field as password', () => {
			const consumerSecretField = credentials.properties.find(p => p.name === 'consumerSecret');

			expect(consumerSecretField).toBeDefined();
			expect(consumerSecretField?.displayName).toBe('Consumer Secret');
			expect(consumerSecretField?.type).toBe('string');
			expect(consumerSecretField?.required).toBe(true);
			expect(consumerSecretField?.typeOptions).toEqual({ password: true });
		});

		it('should have Token ID field', () => {
			const tokenIdField = credentials.properties.find(p => p.name === 'tokenId');

			expect(tokenIdField).toBeDefined();
			expect(tokenIdField?.displayName).toBe('Token ID');
			expect(tokenIdField?.type).toBe('string');
			expect(tokenIdField?.required).toBe(true);
		});

		it('should have Token Secret field as password', () => {
			const tokenSecretField = credentials.properties.find(p => p.name === 'tokenSecret');

			expect(tokenSecretField).toBeDefined();
			expect(tokenSecretField?.displayName).toBe('Token Secret');
			expect(tokenSecretField?.type).toBe('string');
			expect(tokenSecretField?.required).toBe(true);
			expect(tokenSecretField?.typeOptions).toEqual({ password: true });
		});

		it('should have Script ID field', () => {
			const scriptIdField = credentials.properties.find(p => p.name === 'scriptId');

			expect(scriptIdField).toBeDefined();
			expect(scriptIdField?.displayName).toBe('Script ID');
			expect(scriptIdField?.type).toBe('string');
			expect(scriptIdField?.required).toBe(false);
			expect(scriptIdField?.placeholder).toContain('customscript_my_restlet');
			expect(scriptIdField?.placeholder).toContain('1369');
			expect(scriptIdField?.description).toContain('Only required for Netsuite RESTlet node');
			expect(scriptIdField?.description).toContain('custom string');
			expect(scriptIdField?.description).toContain('numeric');
		});

		it('should have Deploy ID field', () => {
			const deployIdField = credentials.properties.find(p => p.name === 'deployId');

			expect(deployIdField).toBeDefined();
			expect(deployIdField?.displayName).toBe('Deploy ID');
			expect(deployIdField?.type).toBe('string');
			expect(deployIdField?.required).toBe(false);
			expect(deployIdField?.placeholder).toContain('customdeploy_my_restlet');
			expect(deployIdField?.placeholder).toContain('1');
			expect(deployIdField?.description).toContain('Only required for Netsuite RESTlet node');
			expect(deployIdField?.description).toContain('custom string');
			expect(deployIdField?.description).toContain('numeric');
		});
	});

	describe('Realm field validation', () => {
		const realmField = () => {
			const creds = new NetsuiteOAuth1Api();
			return creds.properties.find(p => p.name === 'realm');
		};

		it('should show underscore format in placeholder', () => {
			const field = realmField();
			expect(field?.placeholder).toContain('_');
		});

		it('should explicitly mention not to use hyphens', () => {
			const field = realmField();
			expect(field?.description).toMatch(/not.*hyphen/i);
		});

		it('should provide production format example', () => {
			const field = realmField();
			expect(field?.description).toContain('1234567');
		});

		it('should provide sandbox format example', () => {
			const field = realmField();
			expect(field?.description).toContain('1234567_SB1');
		});
	});

	describe('Security best practices', () => {
		it('should mark Consumer Secret as password field', () => {
			const consumerSecretField = credentials.properties.find(p => p.name === 'consumerSecret');
			expect(consumerSecretField?.typeOptions?.password).toBe(true);
		});

		it('should mark Token Secret as password field', () => {
			const tokenSecretField = credentials.properties.find(p => p.name === 'tokenSecret');
			expect(tokenSecretField?.typeOptions?.password).toBe(true);
		});

		it('should not mark Consumer Key as password field', () => {
			const consumerKeyField = credentials.properties.find(p => p.name === 'consumerKey');
			expect(consumerKeyField?.typeOptions?.password).toBeFalsy();
		});

		it('should not mark Token ID as password field', () => {
			const tokenIdField = credentials.properties.find(p => p.name === 'tokenId');
			expect(tokenIdField?.typeOptions?.password).toBeFalsy();
		});
	});

	describe('Authentication configuration', () => {
		it('should have generic authentication type', () => {
			expect(credentials.authenticate).toBeDefined();
			expect(credentials.authenticate.type).toBe('generic');
		});

		it('should have test configuration', () => {
			expect(credentials.test).toBeDefined();
			expect(credentials.test.request).toBeDefined();
			expect(credentials.test.request.method).toBe('GET');
		});
	});
});
