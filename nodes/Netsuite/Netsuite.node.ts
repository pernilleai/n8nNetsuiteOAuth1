import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import OAuth from 'oauth-1.0a';
import * as crypto from 'crypto';

export class Netsuite implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Netsuite RESTlet',
		name: 'netsuite',
		icon: 'file:netsuite.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Netsuite RESTlets using OAuth1 (TBA)',
		defaults: {
			name: 'Netsuite',
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
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'RESTlet',
						value: 'restlet',
					},
				],
				default: 'restlet',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['restlet'],
					},
				},
				options: [
					{
						name: 'GET',
						value: 'get',
						description: 'Execute GET request',
						action: 'Execute GET request',
					},
					{
						name: 'POST',
						value: 'post',
						description: 'Execute POST request',
						action: 'Execute POST request',
					},
					{
						name: 'PUT',
						value: 'put',
						description: 'Execute PUT request',
						action: 'Execute PUT request',
					},
					{
						name: 'DELETE',
						value: 'delete',
						description: 'Execute DELETE request',
						action: 'Execute DELETE request',
					},
				],
				default: 'get',
			},
			{
				displayName: 'Additional Parameters',
				name: 'additionalParameters',
				type: 'string',
				default: '',
				placeholder: '{"recordType": "customer", "id": "123"}',
				description: 'Additional parameters to send as JSON. For GET requests, these will be sent as query parameters. For POST/PUT, they will be sent in the request body.',
				displayOptions: {
					show: {
						resource: ['restlet'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'restlet') {
					const credentials = await this.getCredentials('netsuiteOAuth1Api', i);

					const accountId = credentials.accountId as string;
					const realm = credentials.realm as string;
					const consumerKey = credentials.consumerKey as string;
					const consumerSecret = credentials.consumerSecret as string;
					const tokenId = credentials.tokenId as string;
					const tokenSecret = credentials.tokenSecret as string;
					const scriptId = credentials.scriptId as string;
					const deployId = credentials.deployId as string;

					// Build the RESTlet URL
					const baseUrl = `https://${accountId}.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;

					// Parse additional parameters
					const additionalParametersString = this.getNodeParameter('additionalParameters', i, '') as string;
					let additionalParameters: any = {};

					if (additionalParametersString) {
						try {
							additionalParameters = JSON.parse(additionalParametersString);
						} catch (error) {
							throw new NodeOperationError(
								this.getNode(),
								`Invalid JSON in Additional Parameters: ${error.message}`,
								{ itemIndex: i }
							);
						}
					}

					// Build query parameters
					const queryParams: any = {
						script: scriptId,
						deploy: deployId,
					};

					// For GET and DELETE, add additional parameters to query string
					if (operation === 'get' || operation === 'delete') {
						Object.assign(queryParams, additionalParameters);
					}

					// Build full URL with query parameters
					const queryString = new URLSearchParams(queryParams).toString();
					const url = `${baseUrl}?${queryString}`;

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

					// Prepare request data
					const requestData: any = {
						url: url,
						method: operation.toUpperCase(),
					};

					// For POST and PUT, include body data
					let body = null;
					if (operation === 'post' || operation === 'put') {
						body = additionalParameters;
						requestData.data = body;
					}

					// Generate OAuth headers
					const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

					// Make the request
					const options: any = {
						method: operation.toUpperCase(),
						headers: {
							...authHeader,
							'Content-Type': 'application/json',
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
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
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
