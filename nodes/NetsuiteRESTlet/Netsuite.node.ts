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
		subtitle: 'POST',
		description: 'Interact with Netsuite RESTlets using OAuth1 (TBA)',
		defaults: {
			name: 'Netsuite RESTlet',
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
				displayName: 'Request Body',
				name: 'requestBody',
				type: 'string',
				default: '',
				placeholder: '{"action": "get", "recordType": "customer", "id": "123"}',
				description: 'JSON data to send in the POST request body. Your RESTlet will receive this data.',
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
				const scriptId = credentials.scriptId as string;
				const deployId = credentials.deployId as string;

				// Parse request body
				const requestBodyString = this.getNodeParameter('requestBody', i, '') as string;
				let requestBody: any = {};

				if (requestBodyString) {
					try {
						requestBody = JSON.parse(requestBodyString);
					} catch (error) {
						throw new NodeOperationError(
							this.getNode(),
							`Invalid JSON in Request Body: ${(error as Error).message}`,
							{ itemIndex: i }
						);
					}
				}

				// Build the RESTlet URL with query parameters
				const baseUrl = `https://${accountId}.restlets.api.netsuite.com/app/site/hosting/restlet.nl`;
				const queryParams = new URLSearchParams({
					script: scriptId,
					deploy: deployId,
				});
				const url = `${baseUrl}?${queryParams.toString()}`;

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

				// Prepare request data for OAuth signature
				const requestData: any = {
					url: url,
					method: 'POST',
					data: requestBody,
				};

				// Generate OAuth headers
				const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

				// Make the POST request
				const options: any = {
					method: 'POST',
					headers: {
						...authHeader,
						'Content-Type': 'application/json',
					},
					uri: url,
					body: requestBody,
					json: true,
				};

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
