import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NetsuiteOAuth1Api implements ICredentialType {
	name = 'netsuiteOAuth1Api';
	displayName = 'Netsuite OAuth1 API';
	documentationUrl = 'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4389727047.html';
	properties: INodeProperties[] = [
		{
			displayName: 'Account ID',
			name: 'accountId',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'TSTDRV1234567',
			description: 'Your NetSuite Account ID (e.g., TSTDRV1234567)',
		},
		{
			displayName: 'Realm',
			name: 'realm',
			type: 'string',
			default: '',
			required: true,
			placeholder: '1234567_SB1',
			description: 'Your NetSuite Realm/Account Number. Production: 1234567. Sandbox: 1234567_SB1 (use underscores, not hyphens).',
		},
		{
			displayName: 'Consumer Key',
			name: 'consumerKey',
			type: 'string',
			default: '',
			required: true,
			description: 'OAuth 1.0 Consumer Key from your NetSuite integration record',
		},
		{
			displayName: 'Consumer Secret',
			name: 'consumerSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'OAuth 1.0 Consumer Secret from your NetSuite integration record',
		},
		{
			displayName: 'Token ID',
			name: 'tokenId',
			type: 'string',
			default: '',
			required: true,
			description: 'OAuth 1.0 Token ID from your NetSuite access token',
		},
		{
			displayName: 'Token Secret',
			name: 'tokenSecret',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'OAuth 1.0 Token Secret from your NetSuite access token',
		},
		{
			displayName: 'Script ID',
			name: 'scriptId',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'customscript_my_restlet',
			description: 'The Script ID of your RESTlet script',
		},
		{
			displayName: 'Deploy ID',
			name: 'deployId',
			type: 'string',
			default: '',
			required: true,
			placeholder: 'customdeploy_my_restlet',
			description: 'The Deploy ID of your RESTlet deployment',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			qs: {},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.baseUrl}}',
			url: '',
			method: 'GET',
		},
	};
}
