import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import OAuth from 'oauth-1.0a';
import * as crypto from 'crypto';

export class NetsuiteRest implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Netsuite REST API',
		name: 'netsuiteRest',
		icon: 'file:netsuite.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with NetSuite REST API using OAuth1 (TBA)',
		defaults: {
			name: 'Netsuite REST API',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'netsuiteOAuth1Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Record',
						value: 'get',
						description: 'Retrieve a single record by ID',
						action: 'Get a record',
					},
					{
						name: 'Create Record',
						value: 'create',
						description: 'Create a new record',
						action: 'Create a record',
					},
					{
						name: 'Update Record',
						value: 'update',
						description: 'Update an existing record',
						action: 'Update a record',
					},
					{
						name: 'Delete Record',
						value: 'delete',
						description: 'Delete a record',
						action: 'Delete a record',
					},
					{
						name: 'Upsert Record',
						value: 'upsert',
						description: 'Create or update a record using external ID',
						action: 'Upsert a record',
					},
					{
						name: 'Search (SuiteQL)',
						value: 'search',
						description: 'Query records using SuiteQL',
						action: 'Search records',
					},
					{
						name: 'Transform Record',
						value: 'transform',
						description: 'Transform one record type to another (e.g., Sales Order to Invoice)',
						action: 'Transform a record',
					},
				],
				default: 'get',
			},
			{
				displayName: 'Record Type',
				name: 'recordType',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'customer',
				description: 'The NetSuite record type (e.g., customer, salesorder, invoice)',
				displayOptions: {
					hide: {
						operation: ['search', 'transform'],
					},
				},
			},
			{
				displayName: 'Source Record Type',
				name: 'sourceRecordType',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'salesorder',
				description: 'The source record type to transform from (e.g., salesorder, estimate)',
				displayOptions: {
					show: {
						operation: ['transform'],
					},
				},
			},
			{
				displayName: 'Source Record ID',
				name: 'sourceRecordId',
				type: 'string',
				default: '',
				required: true,
				placeholder: '123',
				description: 'The internal ID of the source record',
				displayOptions: {
					show: {
						operation: ['transform'],
					},
				},
			},
			{
				displayName: 'Target Record Type',
				name: 'targetRecordType',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'invoice',
				description: 'The target record type to transform to (e.g., invoice, salesorder)',
				displayOptions: {
					show: {
						operation: ['transform'],
					},
				},
			},
			{
				displayName: 'Record ID',
				name: 'recordId',
				type: 'string',
				default: '',
				required: true,
				placeholder: '123',
				description: 'The internal ID of the record',
				displayOptions: {
					show: {
						operation: ['get', 'update', 'delete'],
					},
				},
			},
			{
				displayName: 'External ID Field',
				name: 'externalIdField',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'externalId',
				description: 'The field name used for external ID matching',
				displayOptions: {
					show: {
						operation: ['upsert'],
					},
				},
			},
			{
				displayName: 'External ID Value',
				name: 'externalIdValue',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'EXT-12345',
				description: 'The external ID value to match',
				displayOptions: {
					show: {
						operation: ['upsert'],
					},
				},
			},
			{
				displayName: 'Record Data',
				name: 'recordData',
				type: 'string',
				default: '',
				required: true,
				placeholder: '{"companyName": "Acme Corp", "email": "contact@acme.com"}',
				description: 'JSON object with field values for the record',
				displayOptions: {
					show: {
						operation: ['create', 'update', 'upsert'],
					},
				},
			},
			{
				displayName: 'Transform Data',
				name: 'transformData',
				type: 'string',
				default: '{}',
				placeholder: '{"memo": "Transformed from Sales Order", "tranDate": "2025-01-15"}',
				description: 'Optional JSON object with field values to override during transformation',
				displayOptions: {
					show: {
						operation: ['transform'],
					},
				},
			},
			{
				displayName: 'SuiteQL Query',
				name: 'suiteqlQuery',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'SELECT id, companyname, email FROM customer WHERE email LIKE \'%@acme.com\'',
				description: 'SuiteQL query to execute',
				displayOptions: {
					show: {
						operation: ['search'],
					},
				},
				typeOptions: {
					rows: 4,
				},
			},
			{
				displayName: 'Additional Options',
				name: 'additionalOptions',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Expand Sublists',
						name: 'expandSubresources',
						type: 'boolean',
						default: false,
						description: 'Whether to expand sublist data in the response',
						displayOptions: {
							show: {
								'/operation': ['get'],
							},
						},
					},
					{
						displayName: 'Fields',
						name: 'fields',
						type: 'string',
						default: '',
						placeholder: 'companyName,email,phone',
						description: 'Comma-separated list of fields to return (leave empty for all)',
						displayOptions: {
							show: {
								'/operation': ['get'],
							},
						},
					},
					{
						displayName: 'Limit',
						name: 'limit',
						type: 'number',
						default: 1000,
						description: 'Maximum number of records to return',
						displayOptions: {
							show: {
								'/operation': ['search'],
							},
						},
					},
					{
						displayName: 'Offset',
						name: 'offset',
						type: 'number',
						default: 0,
						description: 'Number of records to skip',
						displayOptions: {
							show: {
								'/operation': ['search'],
							},
						},
					},
				],
			},
			{
				displayName: 'Created by pernille-ai.com',
				name: 'attribution',
				type: 'notice',
				default: '',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const credentials = await this.getCredentials('netsuiteOAuth1Api', i);

				const accountId = credentials.accountId as string;
				// Convert any hyphens to underscores in realm (NetSuite requires underscores)
				const realm = (credentials.realm as string).replace(/-/g, '_');
				const consumerKey = credentials.consumerKey as string;
				const consumerSecret = credentials.consumerSecret as string;
				const tokenId = credentials.tokenId as string;
				const tokenSecret = credentials.tokenSecret as string;

				const operation = this.getNodeParameter('operation', i) as string;

				// Set up OAuth1
				const oauth = new OAuth({
					consumer: {
						key: consumerKey,
						secret: consumerSecret,
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

				const token = {
					key: tokenId,
					secret: tokenSecret,
				};

				let method = 'GET';
				let endpoint = '';
				let body: any = null;

				const baseUrl = `https://${accountId}.suitetalk.api.netsuite.com/services/rest`;

				switch (operation) {
					case 'get': {
						const recordType = this.getNodeParameter('recordType', i) as string;
						const recordId = this.getNodeParameter('recordId', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
							expandSubresources?: boolean;
							fields?: string;
						};

						method = 'GET';
						endpoint = `/record/v1/${recordType}/${recordId}`;

						const queryParams: string[] = [];
						if (additionalOptions.expandSubresources) {
							queryParams.push('expandSubResources=true');
						}
						if (additionalOptions.fields) {
							queryParams.push(`fields=${encodeURIComponent(additionalOptions.fields)}`);
						}
						if (queryParams.length > 0) {
							endpoint += `?${queryParams.join('&')}`;
						}
						break;
					}

					case 'create': {
						const recordType = this.getNodeParameter('recordType', i) as string;
						const recordDataString = this.getNodeParameter('recordData', i) as string;

						try {
							body = JSON.parse(recordDataString);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid JSON in Record Data: ${(error as Error).message}`,
								{ itemIndex: i }
							);
						}

						method = 'POST';
						endpoint = `/record/v1/${recordType}`;
						break;
					}

					case 'update': {
						const recordType = this.getNodeParameter('recordType', i) as string;
						const recordId = this.getNodeParameter('recordId', i) as string;
						const recordDataString = this.getNodeParameter('recordData', i) as string;

						try {
							body = JSON.parse(recordDataString);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid JSON in Record Data: ${(error as Error).message}`,
								{ itemIndex: i }
							);
						}

						method = 'PATCH';
						endpoint = `/record/v1/${recordType}/${recordId}`;
						break;
					}

					case 'delete': {
						const recordType = this.getNodeParameter('recordType', i) as string;
						const recordId = this.getNodeParameter('recordId', i) as string;

						method = 'DELETE';
						endpoint = `/record/v1/${recordType}/${recordId}`;
						break;
					}

					case 'upsert': {
						const recordType = this.getNodeParameter('recordType', i) as string;
						const externalIdField = this.getNodeParameter('externalIdField', i) as string;
						const externalIdValue = this.getNodeParameter('externalIdValue', i) as string;
						const recordDataString = this.getNodeParameter('recordData', i) as string;

						try {
							body = JSON.parse(recordDataString);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid JSON in Record Data: ${(error as Error).message}`,
								{ itemIndex: i }
							);
						}

						method = 'PUT';
						endpoint = `/record/v1/${recordType}/${externalIdField}/${externalIdValue}`;
						break;
					}

					case 'search': {
						const suiteqlQuery = this.getNodeParameter('suiteqlQuery', i) as string;
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as {
							limit?: number;
							offset?: number;
						};

						method = 'POST';
						endpoint = '/query/v1/suiteql';

						body = {
							q: suiteqlQuery,
						};

						// Add pagination as URL query parameters (NetSuite requirement)
						const queryParams: string[] = [];
						if (additionalOptions.limit) {
							queryParams.push(`limit=${additionalOptions.limit}`);
						}
						if (additionalOptions.offset) {
							queryParams.push(`offset=${additionalOptions.offset}`);
						}
						if (queryParams.length > 0) {
							endpoint += `?${queryParams.join('&')}`;
						}
						break;
					}

					case 'transform': {
						const sourceRecordType = this.getNodeParameter('sourceRecordType', i) as string;
						const sourceRecordId = this.getNodeParameter('sourceRecordId', i) as string;
						const targetRecordType = this.getNodeParameter('targetRecordType', i) as string;
						const transformDataString = this.getNodeParameter('transformData', i, '{}') as string;

						try {
							body = JSON.parse(transformDataString);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid JSON in Transform Data: ${(error as Error).message}`,
								{ itemIndex: i }
							);
						}

						method = 'POST';
						endpoint = `/record/v1/${sourceRecordType}/${sourceRecordId}/!transform/${targetRecordType}`;
						break;
					}

					default:
						throw new NodeOperationError(
							this.getNode(),
							`Unknown operation: ${operation}`,
							{ itemIndex: i }
						);
				}

				const url = `${baseUrl}${endpoint}`;

				// Prepare request data for OAuth signature
				const requestData: any = {
					url: url,
					method: method,
				};

				if (body) {
					requestData.data = body;
				}

				// Generate OAuth headers
				const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

				// Make the request
				const options: any = {
					method: method,
					headers: {
						...authHeader,
						'Content-Type': 'application/json',
						'Accept': 'application/json',
						'Prefer': 'transient',
					},
					uri: url,
					json: true,
				};

				if (body) {
					options.body = body;
				}

				const response = await this.helpers.request(options);

				returnData.push({
					json: response,
					pairedItem: { item: i },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
