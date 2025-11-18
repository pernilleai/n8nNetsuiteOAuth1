import { Netsuite } from '../nodes/NetsuiteRESTlet/Netsuite.node';

/**
 * Test suite for NetSuite RESTlet node
 *
 * These tests verify:
 * 1. Node metadata and configuration
 * 2. Field configurations are correct
 * 3. Attribution notice is present
 */
describe('NetSuite RESTlet Node', () => {
	let netsuiteRestletNode: Netsuite;

	beforeEach(() => {
		netsuiteRestletNode = new Netsuite();
	});

	describe('Node metadata', () => {
		it('should have correct name', () => {
			expect(netsuiteRestletNode.description.name).toBe('netsuite');
		});

		it('should have correct display name', () => {
			expect(netsuiteRestletNode.description.displayName).toBe('Netsuite RESTlet');
		});

		it('should have correct default name', () => {
			expect(netsuiteRestletNode.description.defaults.name).toBe('Netsuite RESTlet');
		});

		it('should have correct icon', () => {
			expect(netsuiteRestletNode.description.icon).toBe('file:netsuite.svg');
		});

		it('should have correct group', () => {
			expect(netsuiteRestletNode.description.group).toEqual(['transform']);
		});

		it('should have version 1', () => {
			expect(netsuiteRestletNode.description.version).toBe(1);
		});

		it('should have correct subtitle', () => {
			expect(netsuiteRestletNode.description.subtitle).toBe('POST');
		});

		it('should have correct description', () => {
			expect(netsuiteRestletNode.description.description).toBe('Interact with Netsuite RESTlets using OAuth1 (TBA)');
		});

		it('should use netsuiteOAuth1Api credentials', () => {
			expect(netsuiteRestletNode.description.credentials).toEqual([
				{
					name: 'netsuiteOAuth1Api',
					required: true,
				},
			]);
		});

		it('should have main inputs and outputs', () => {
			expect(netsuiteRestletNode.description.inputs).toEqual(['main']);
			expect(netsuiteRestletNode.description.outputs).toEqual(['main']);
		});
	});

	describe('Field configurations', () => {
		it('should have Request Body field', () => {
			const field = netsuiteRestletNode.description.properties.find(p => p.name === 'requestBody');

			expect(field).toBeDefined();
			expect(field?.displayName).toBe('Request Body');
			expect(field?.type).toBe('string');
			expect(field?.default).toBe('');
			expect(field?.placeholder).toContain('action');
			expect(field?.placeholder).toContain('recordType');
			expect(field?.description).toContain('JSON data to send in the POST request body');
		});

		it('should have 2 properties total (requestBody + attribution)', () => {
			expect(netsuiteRestletNode.description.properties).toHaveLength(2);
		});
	});

	describe('Attribution', () => {
		it('should have attribution notice', () => {
			const attributionField = netsuiteRestletNode.description.properties.find(p => p.name === 'attribution');

			expect(attributionField).toBeDefined();
			expect(attributionField?.displayName).toBe('Created by pernille-ai.com');
			expect(attributionField?.type).toBe('notice');
			expect(attributionField?.default).toBe('');
		});

		it('should have attribution as last property', () => {
			const lastProperty = netsuiteRestletNode.description.properties[netsuiteRestletNode.description.properties.length - 1];
			expect(lastProperty.name).toBe('attribution');
		});
	});

	describe('Node execution', () => {
		it('should have execute function', () => {
			expect(netsuiteRestletNode.execute).toBeDefined();
			expect(typeof netsuiteRestletNode.execute).toBe('function');
		});
	});
});
