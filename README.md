# n8n-nodes-netsuite-oauth1

This is an n8n community node that allows you to use Netsuite RESTlets with OAuth1 (Token-Based Authentication) in your n8n workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### Community Node Installation

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-netsuite-oauth1` in **Enter npm package name**
4. Agree to the risks and select **Install**

After installing the node, you can use it like any other node in n8n.

### Manual Installation (for development)

```bash
npm install n8n-nodes-netsuite-oauth1
```

## Prerequisites

Before using this node, you need to set up OAuth1 (TBA) authentication in your NetSuite account:

### 1. Create an Integration Record in NetSuite

1. Go to **Setup > Integration > Manage Integrations > New**
2. Enter a name for your integration (e.g., "n8n Integration")
3. Check **Token-Based Authentication**
4. Save the record
5. Copy the **Consumer Key** and **Consumer Secret** (you'll need these later)

### 2. Create an Access Token

1. Go to **Setup > Users/Roles > Access Tokens > New**
2. Select the **Application Name** (the integration you created)
3. Select the **User**
4. Select the **Role**
5. Save the record
6. Copy the **Token ID** and **Token Secret** (you'll need these later)

### 3. Create a RESTlet Script

Create a RESTlet script in NetSuite. Here's a simple example:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define([], () => {
    const get = (context) => {
        return {
            success: true,
            message: 'GET request received',
            data: context
        };
    };

    const post = (context) => {
        return {
            success: true,
            message: 'POST request received',
            data: context
        };
    };

    const put = (context) => {
        return {
            success: true,
            message: 'PUT request received',
            data: context
        };
    };

    const _delete = (context) => {
        return {
            success: true,
            message: 'DELETE request received',
            data: context
        };
    };

    return {
        get: get,
        post: post,
        put: put,
        delete: _delete
    };
});
```

4. Deploy the script and note the **Script ID** and **Deploy ID**

## Credentials Configuration

When setting up the Netsuite OAuth1 API credentials in n8n, you'll need:

1. **Account ID**: Your NetSuite account ID (e.g., `TSTDRV1234567`)
2. **Realm**: Your NetSuite account number. Production: `1234567`. Sandbox: `1234567_SB1` (use underscores, not hyphens)
3. **Consumer Key**: From your Integration Record
4. **Consumer Secret**: From your Integration Record
5. **Token ID**: From your Access Token
6. **Token Secret**: From your Access Token
7. **Script ID**: The Script ID of your RESTlet (e.g., `customscript_my_restlet`)
8. **Deploy ID**: The Deploy ID of your RESTlet deployment (e.g., `customdeploy_my_restlet`)

### Finding Your Account ID and Realm

- **Account ID**: Found in **Setup > Company > Company Information** (the full account ID including any prefix)
- **Realm**: Your account number (production: `1234567`, sandbox: `1234567_SB1` with underscores). Found in your NetSuite URL or Company Information

## Operations

The node supports the following HTTP methods:

- **GET**: Retrieve data from your RESTlet
- **POST**: Send data to your RESTlet
- **PUT**: Update data via your RESTlet
- **DELETE**: Delete data via your RESTlet

## Usage

### Additional Parameters

You can pass additional parameters to your RESTlet as JSON:

**For GET requests:** Parameters are sent as query string parameters
```json
{
  "recordType": "customer",
  "id": "123"
}
```

**For POST/PUT requests:** Parameters are sent in the request body
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Example Workflow

1. Add the **Netsuite RESTlet** node to your workflow
2. Select or create **Netsuite OAuth1 API** credentials
3. Choose an **Operation** (GET, POST, PUT, or DELETE)
4. Add any **Additional Parameters** as needed
5. Execute the workflow

## Compatibility

- Tested with n8n version 1.0.0+
- Compatible with NetSuite 2021.1+

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [NetSuite RESTlet documentation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_4387172221.html)
- [NetSuite OAuth 1.0 documentation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4389727047.html)

## Development

### Build the node

```bash
npm install
npm run build
```

### Running Tests

This project includes comprehensive Jest tests for OAuth signature generation and credential validation:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Tests are automatically run on every commit via GitHub Actions.

### Testing in n8n

Link the node to your local n8n installation:

```bash
cd /path/to/n8n
npm link /path/to/n8n-nodes-netsuite-oauth1
```

Restart n8n and the node should appear in the nodes panel.

## License

[MIT](LICENSE)

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/pernilleai/n8nNetsuiteOAuth1).
