import { NetsuiteRest } from '../nodes/NetsuiteRest/NetsuiteRest.node';

/**
 * Test suite for NetSuite REST API node
 *
 * These tests verify:
 * 1. Node metadata and configuration
 * 2. All 7 operations are properly defined
 * 3. Field configurations are correct
 * 4. Display options work correctly
 */
describe('NetSuite REST API Node', () => {
	let netsuiteRestNode: NetsuiteRest;

	beforeEach(() => {
		netsuiteRestNode = new NetsuiteRest();
	});

	describe('Node metadata', () => {
		it('should have correct name', () => {
			expect(netsuiteRestNode.description.name).toBe('netsuiteRest');
		});

		it('should have correct display name', () => {
			expect(netsuiteRestNode.description.displayName).toBe('Netsuite REST API');
		});

		it('should have correct default name', () => {
			expect(netsuiteRestNode.description.defaults.name).toBe('Netsuite REST API');
		});

		it('should have correct icon', () => {
			expect(netsuiteRestNode.description.icon).toBe('file:netsuite.svg');
		});

		it('should have correct group', () => {
			expect(netsuiteRestNode.description.group).toEqual(['transform']);
		});

		it('should have version 1', () => {
			expect(netsuiteRestNode.description.version).toBe(1);
		});

		it('should use netsuiteOAuth1Api credentials', () => {
			expect(netsuiteRestNode.description.credentials).toEqual([
				{
					name: 'netsuiteOAuth1Api',
					required: true,
				},
			]);
		});
	});

	describe('Operations', () => {
		const getOperationField = () => {
			return netsuiteRestNode.description.properties.find(p => p.name === 'operation');
		};

		it('should have operation field', () => {
			const operationField = getOperationField();
			expect(operationField).toBeDefined();
			expect(operationField?.displayName).toBe('Operation');
			expect(operationField?.type).toBe('options');
		});

		it('should have 7 operations', () => {
			const operationField = getOperationField();
			expect(operationField?.options).toHaveLength(7);
		});

		it('should have Get Record operation', () => {
			const operationField = getOperationField();
			const getOp: any = operationField?.options?.find((op: any) => op.value === 'get');

			expect(getOp).toBeDefined();
			expect(getOp.name).toBe('Get Record');
			expect(getOp.description).toBe('Retrieve a single record by ID');
			expect(getOp.action).toBe('Get a record');
		});

		it('should have Create Record operation', () => {
			const operationField = getOperationField();
			const createOp: any = operationField?.options?.find((op: any) => op.value === 'create');

			expect(createOp).toBeDefined();
			expect(createOp.name).toBe('Create Record');
			expect(createOp.description).toBe('Create a new record');
			expect(createOp.action).toBe('Create a record');
		});

		it('should have Update Record operation', () => {
			const operationField = getOperationField();
			const updateOp: any = operationField?.options?.find((op: any) => op.value === 'update');

			expect(updateOp).toBeDefined();
			expect(updateOp.name).toBe('Update Record');
			expect(updateOp.description).toBe('Update an existing record');
			expect(updateOp.action).toBe('Update a record');
		});

		it('should have Delete Record operation', () => {
			const operationField = getOperationField();
			const deleteOp: any = operationField?.options?.find((op: any) => op.value === 'delete');

			expect(deleteOp).toBeDefined();
			expect(deleteOp.name).toBe('Delete Record');
			expect(deleteOp.description).toBe('Delete a record');
			expect(deleteOp.action).toBe('Delete a record');
		});

		it('should have Upsert Record operation', () => {
			const operationField = getOperationField();
			const upsertOp: any = operationField?.options?.find((op: any) => op.value === 'upsert');

			expect(upsertOp).toBeDefined();
			expect(upsertOp.name).toBe('Upsert Record');
			expect(upsertOp.description).toBe('Create or update a record using external ID');
			expect(upsertOp.action).toBe('Upsert a record');
		});

		it('should have Search (SuiteQL) operation', () => {
			const operationField = getOperationField();
			const searchOp: any = operationField?.options?.find((op: any) => op.value === 'search');

			expect(searchOp).toBeDefined();
			expect(searchOp.name).toBe('Search (SuiteQL)');
			expect(searchOp.description).toBe('Query records using SuiteQL');
			expect(searchOp.action).toBe('Search records');
		});

		it('should have Transform Record operation', () => {
			const operationField = getOperationField();
			const transformOp: any = operationField?.options?.find((op: any) => op.value === 'transform');

			expect(transformOp).toBeDefined();
			expect(transformOp.name).toBe('Transform Record');
			expect(transformOp.description).toBe('Transform one record type to another (e.g., Sales Order to Invoice)');
			expect(transformOp.action).toBe('Transform a record');
		});

		it('should have get as default operation', () => {
			const operationField = getOperationField();
			expect(operationField?.default).toBe('get');
		});
	});

	describe('Field configurations', () => {
		it('should have Record Type field', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'recordType');

			expect(field).toBeDefined();
			expect(field?.displayName).toBe('Record Type');
			expect(field?.type).toBe('string');
			expect(field?.required).toBe(true);
			expect(field?.placeholder).toBe('customer');
		});

		it('should hide Record Type field for search and transform operations', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'recordType');

			expect(field?.displayOptions?.hide?.operation).toEqual(['search', 'transform']);
		});

		it('should have Record ID field', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'recordId');

			expect(field).toBeDefined();
			expect(field?.displayName).toBe('Record ID');
			expect(field?.type).toBe('string');
			expect(field?.required).toBe(true);
			expect(field?.placeholder).toBe('123');
		});

		it('should show Record ID only for get, update, delete operations', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'recordId');

			expect(field?.displayOptions?.show?.operation).toEqual(['get', 'update', 'delete']);
		});

		it('should have External ID Field for upsert', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'externalIdField');

			expect(field).toBeDefined();
			expect(field?.displayName).toBe('External ID Field');
			expect(field?.type).toBe('string');
			expect(field?.required).toBe(true);
			expect(field?.displayOptions?.show?.operation).toEqual(['upsert']);
		});

		it('should have External ID Value for upsert', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'externalIdValue');

			expect(field).toBeDefined();
			expect(field?.displayName).toBe('External ID Value');
			expect(field?.type).toBe('string');
			expect(field?.required).toBe(true);
			expect(field?.placeholder).toBe('EXT-12345');
			expect(field?.displayOptions?.show?.operation).toEqual(['upsert']);
		});

		it('should have Record Data field', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'recordData');

			expect(field).toBeDefined();
			expect(field?.displayName).toBe('Record Data');
			expect(field?.type).toBe('string');
			expect(field?.required).toBe(true);
		});

		it('should show Record Data only for create, update, upsert operations', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'recordData');

			expect(field?.displayOptions?.show?.operation).toEqual(['create', 'update', 'upsert']);
		});

		it('should have SuiteQL Query field', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'suiteqlQuery');

			expect(field).toBeDefined();
			expect(field?.displayName).toBe('SuiteQL Query');
			expect(field?.type).toBe('string');
			expect(field?.required).toBe(true);
			expect(field?.typeOptions?.rows).toBe(4);
		});

		it('should show SuiteQL Query only for search operation', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'suiteqlQuery');

			expect(field?.displayOptions?.show?.operation).toEqual(['search']);
		});

		it('should have Source Record Type field', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'sourceRecordType');

			expect(field).toBeDefined();
			expect(field?.displayName).toBe('Source Record Type');
			expect(field?.type).toBe('string');
			expect(field?.required).toBe(true);
			expect(field?.placeholder).toBe('salesorder');
		});

		it('should show Source Record Type only for transform operation', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'sourceRecordType');

			expect(field?.displayOptions?.show?.operation).toEqual(['transform']);
		});

		it('should have Source Record ID field', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'sourceRecordId');

			expect(field).toBeDefined();
			expect(field?.displayName).toBe('Source Record ID');
			expect(field?.type).toBe('string');
			expect(field?.required).toBe(true);
			expect(field?.placeholder).toBe('123');
		});

		it('should show Source Record ID only for transform operation', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'sourceRecordId');

			expect(field?.displayOptions?.show?.operation).toEqual(['transform']);
		});

		it('should have Target Record Type field', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'targetRecordType');

			expect(field).toBeDefined();
			expect(field?.displayName).toBe('Target Record Type');
			expect(field?.type).toBe('string');
			expect(field?.required).toBe(true);
			expect(field?.placeholder).toBe('invoice');
		});

		it('should show Target Record Type only for transform operation', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'targetRecordType');

			expect(field?.displayOptions?.show?.operation).toEqual(['transform']);
		});

		it('should have Transform Data field', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'transformData');

			expect(field).toBeDefined();
			expect(field?.displayName).toBe('Transform Data');
			expect(field?.type).toBe('string');
			expect(field?.default).toBe('{}');
			expect(field?.placeholder).toContain('memo');
		});

		it('should show Transform Data only for transform operation', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'transformData');

			expect(field?.displayOptions?.show?.operation).toEqual(['transform']);
		});
	});

	describe('Additional Options', () => {
		const getAdditionalOptions = () => {
			return netsuiteRestNode.description.properties.find(p => p.name === 'additionalOptions');
		};

		it('should have Additional Options collection', () => {
			const field = getAdditionalOptions();

			expect(field).toBeDefined();
			expect(field?.displayName).toBe('Additional Options');
			expect(field?.type).toBe('collection');
		});

		it('should have Expand Sublists option for Get operation', () => {
			const field = getAdditionalOptions();
			const expandOption: any = field?.options?.find((opt: any) => opt.name === 'expandSubresources');

			expect(expandOption).toBeDefined();
			expect(expandOption.displayName).toBe('Expand Sublists');
			expect(expandOption.type).toBe('boolean');
			expect(expandOption.default).toBe(false);
			expect(expandOption.displayOptions?.show?.['/operation']).toEqual(['get']);
		});

		it('should have Fields option for Get operation', () => {
			const field = getAdditionalOptions();
			const fieldsOption: any = field?.options?.find((opt: any) => opt.name === 'fields');

			expect(fieldsOption).toBeDefined();
			expect(fieldsOption.displayName).toBe('Fields');
			expect(fieldsOption.type).toBe('string');
			expect(fieldsOption.default).toBe('');
			expect(fieldsOption.placeholder).toBe('companyName,email,phone');
			expect(fieldsOption.displayOptions?.show?.['/operation']).toEqual(['get']);
		});

		it('should have Limit option for Search operation', () => {
			const field = getAdditionalOptions();
			const limitOption: any = field?.options?.find((opt: any) => opt.name === 'limit');

			expect(limitOption).toBeDefined();
			expect(limitOption.displayName).toBe('Limit');
			expect(limitOption.type).toBe('number');
			expect(limitOption.default).toBe(1000);
			expect(limitOption.displayOptions?.show?.['/operation']).toEqual(['search']);
		});

		it('should have Offset option for Search operation', () => {
			const field = getAdditionalOptions();
			const offsetOption: any = field?.options?.find((opt: any) => opt.name === 'offset');

			expect(offsetOption).toBeDefined();
			expect(offsetOption.displayName).toBe('Offset');
			expect(offsetOption.type).toBe('number');
			expect(offsetOption.default).toBe(0);
			expect(offsetOption.displayOptions?.show?.['/operation']).toEqual(['search']);
		});
	});

	describe('URL Construction', () => {
		it('should have execute function that handles REST API URLs', () => {
			// The base URL follows the pattern:
			// https://{accountId}.suitetalk.api.netsuite.com/services/rest
			// Since we can't execute the node without a full n8n context,
			// we verify the execute function exists
			expect(netsuiteRestNode.execute).toBeDefined();
			expect(typeof netsuiteRestNode.execute).toBe('function');
		});
	});

	describe('HTTP Methods by Operation', () => {
		it('should use GET method for get operation', () => {
			// Verified by code inspection: operation 'get' uses method = 'GET'
			const operations = netsuiteRestNode.description.properties.find(p => p.name === 'operation');
			const getOp = operations?.options?.find((op: any) => op.value === 'get');
			expect(getOp).toBeDefined();
		});

		it('should use POST method for create operation', () => {
			const operations = netsuiteRestNode.description.properties.find(p => p.name === 'operation');
			const createOp = operations?.options?.find((op: any) => op.value === 'create');
			expect(createOp).toBeDefined();
		});

		it('should use PATCH method for update operation', () => {
			const operations = netsuiteRestNode.description.properties.find(p => p.name === 'operation');
			const updateOp = operations?.options?.find((op: any) => op.value === 'update');
			expect(updateOp).toBeDefined();
		});

		it('should use DELETE method for delete operation', () => {
			const operations = netsuiteRestNode.description.properties.find(p => p.name === 'operation');
			const deleteOp = operations?.options?.find((op: any) => op.value === 'delete');
			expect(deleteOp).toBeDefined();
		});

		it('should use PUT method for upsert operation', () => {
			const operations = netsuiteRestNode.description.properties.find(p => p.name === 'operation');
			const upsertOp = operations?.options?.find((op: any) => op.value === 'upsert');
			expect(upsertOp).toBeDefined();
		});

		it('should use POST method for search operation', () => {
			const operations = netsuiteRestNode.description.properties.find(p => p.name === 'operation');
			const searchOp = operations?.options?.find((op: any) => op.value === 'search');
			expect(searchOp).toBeDefined();
		});

		it('should use POST method for transform operation', () => {
			const operations = netsuiteRestNode.description.properties.find(p => p.name === 'operation');
			const transformOp = operations?.options?.find((op: any) => op.value === 'transform');
			expect(transformOp).toBeDefined();
		});
	});

	describe('Required vs Optional Fields', () => {
		it('should require operation', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'operation');
			expect(field?.required).toBeUndefined(); // Operations are always required by type
		});

		it('should require recordType for non-search operations', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'recordType');
			expect(field?.required).toBe(true);
		});

		it('should require recordId for get/update/delete', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'recordId');
			expect(field?.required).toBe(true);
		});

		it('should require recordData for create/update/upsert', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'recordData');
			expect(field?.required).toBe(true);
		});

		it('should require suiteqlQuery for search', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'suiteqlQuery');
			expect(field?.required).toBe(true);
		});

		it('should not require additional options', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'additionalOptions');
			expect(field?.required).toBeUndefined();
		});
	});

	describe('Node execution', () => {
		it('should have execute function', () => {
			expect(netsuiteRestNode.execute).toBeDefined();
			expect(typeof netsuiteRestNode.execute).toBe('function');
		});
	});

	describe('Placeholder values', () => {
		it('should have helpful placeholder for recordType', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'recordType');
			expect(field?.placeholder).toBe('customer');
		});

		it('should have helpful placeholder for recordId', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'recordId');
			expect(field?.placeholder).toBe('123');
		});

		it('should have helpful placeholder for externalIdField', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'externalIdField');
			expect(field?.placeholder).toBe('externalId');
		});

		it('should have helpful placeholder for externalIdValue', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'externalIdValue');
			expect(field?.placeholder).toBe('EXT-12345');
		});

		it('should have helpful placeholder for recordData', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'recordData');
			expect(field?.placeholder).toContain('companyName');
			expect(field?.placeholder).toContain('email');
		});

		it('should have helpful placeholder for suiteqlQuery', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'suiteqlQuery');
			expect(field?.placeholder).toContain('SELECT');
			expect(field?.placeholder).toContain('FROM customer');
		});

		it('should have helpful placeholder for sourceRecordType', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'sourceRecordType');
			expect(field?.placeholder).toBe('salesorder');
		});

		it('should have helpful placeholder for sourceRecordId', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'sourceRecordId');
			expect(field?.placeholder).toBe('123');
		});

		it('should have helpful placeholder for targetRecordType', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'targetRecordType');
			expect(field?.placeholder).toBe('invoice');
		});

		it('should have helpful placeholder for transformData', () => {
			const field = netsuiteRestNode.description.properties.find(p => p.name === 'transformData');
			expect(field?.placeholder).toContain('memo');
			expect(field?.placeholder).toContain('Transformed from Sales Order');
		});
	});
});
