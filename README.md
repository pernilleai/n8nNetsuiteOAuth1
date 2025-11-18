# n8n-nodes-netsuite-oauth1

This is an n8n community node that provides two ways to integrate with NetSuite using OAuth1 (Token-Based Authentication):

1. **Netsuite RESTlet** - For calling custom RESTlet scripts you deploy in NetSuite
2. **Netsuite REST API** - For using NetSuite's built-in REST API with standard CRUD operations

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

Before using this node, you need to set up OAuth1 (Token-Based Authentication) in your NetSuite account and deploy a RESTlet script. This guide provides step-by-step instructions.

---

## Part 1: Setting Up OAuth1 Authentication in NetSuite

### Step 1: Create an Integration Record

The Integration Record generates the Consumer Key and Consumer Secret needed for OAuth1 authentication.

1. **Navigate to Integration Management**
   - Log in to your NetSuite account
   - Go to **Setup > Integration > Manage Integrations > New**

2. **Configure the Integration**
   - **Name**: Enter a descriptive name (e.g., "n8n Integration" or "n8n Workflow Automation")
   - **State**: Leave as **Enabled**
   - **Token-Based Authentication**: ✅ **Check this box** (this is required for OAuth1)
   - **TBA: Authorization Flow**: Leave unchecked (not needed for server-to-server)
   - **User Credentials**: Leave unchecked

3. **Save the Integration**
   - Click **Save**
   - ⚠️ **IMPORTANT**: NetSuite will display your **Consumer Key** and **Consumer Secret** only once
   - **Copy and save these credentials securely** - you'll need them later for n8n

4. **Note Your Integration Internal ID**
   - After saving, note the **Internal ID** shown in the URL or on the page
   - You'll need this when creating the Access Token

### Step 2: Create an Access Token

The Access Token generates the Token ID and Token Secret for a specific user and role.

1. **Navigate to Access Tokens**
   - Go to **Setup > Users/Roles > Access Tokens > New**

2. **Configure the Access Token**
   - **Application Name**: Select the integration you created in Step 1 (e.g., "n8n Integration")
   - **User**: Select the NetSuite user that will execute the RESTlet
     - ⚠️ This user must have sufficient permissions to perform the operations in your RESTlet
     - Recommended: Create a dedicated "Integration User" with specific role permissions
   - **Role**: Select the role for this token
     - This determines what data and operations the integration can access
     - The role must have the "Web Services" permission enabled
     - The role must have "RESTlet" script deployment permissions
   - **Token Name**: Optional descriptive name (e.g., "n8n Workflow Token")

3. **Save the Token**
   - Click **Save**
   - ⚠️ **IMPORTANT**: NetSuite will display your **Token ID** and **Token Secret** only once
   - **Copy and save these credentials securely** - you'll need them later for n8n

4. **Important Notes**
   - The token is tied to the specific user and role you selected
   - If you need different permissions, create additional tokens with different roles
   - Tokens can be revoked at any time from the Access Tokens page

### Step 3: Find Your Account Information

You need your NetSuite Account ID and Realm for authentication.

1. **Find Your Account ID**
   - Go to **Setup > Company > Company Information**
   - Look for **Account ID** (e.g., `TSTDRV1234567` for sandbox, or just `1234567` for production)
   - Some accounts show a prefix like `TSTDRV` or other identifiers
   - Copy the **full Account ID including any prefix**

2. **Find Your Realm**
   - The **Realm** is your account number
   - ⚠️ **IMPORTANT**: NetSuite displays account IDs with **hyphens** in URLs, but the OAuth realm requires **underscores**
     - In NetSuite URLs: `1234567-SB1` (with hyphen)
     - In OAuth realm: `1234567_SB1` (with underscore)
     - ✅ Correct: `1234567_SB1`
     - ❌ Wrong: `1234567-SB1`
   - Examples from NetSuite URLs:
     - Production: `https://1234567.app.netsuite.com` → Realm: `1234567` (no hyphen, no conversion needed)
     - Sandbox: `https://1234567-sb1.app.netsuite.com` → Realm: `1234567_SB1` (convert hyphen to underscore)
   - **Rule**: Convert any hyphens you see in the account ID to underscores for the realm parameter

**Summary of Credentials Collected:**
- ✅ Consumer Key (from Integration Record)
- ✅ Consumer Secret (from Integration Record)
- ✅ Token ID (from Access Token)
- ✅ Token Secret (from Access Token)
- ✅ Account ID (from Company Information)
- ✅ Realm (derived from Account ID)

---

## Part 2: Creating and Deploying a RESTlet Script

### Step 4: Create a RESTlet Script

RESTlets are custom web services in NetSuite that allow external applications to interact with your data.

1. **Create the Script File**
   - On your local computer, create a JavaScript file (e.g., `n8n_restlet.js`)
   - Use the example below as a starting point:

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/log'], (log) => {
    const post = (context) => {
        log.debug('n8n Request Received', context);

        // Handle different actions based on request body
        const action = context.action || 'unknown';

        return {
            success: true,
            action: action,
            message: `${action} request processed`,
            data: context
        };
    };

    // Only expose POST endpoint (standard NetSuite pattern)
    return {
        post: post
    };
});
```

   - For a more complete example with CRUD operations, see `examples/sample-restlet.js` in this repository

2. **Upload the Script to NetSuite**
   - Go to **Customization > Scripting > Scripts > New**
   - Click **Upload** (the plus icon next to "Script File")
   - Click **Choose File** and select your `n8n_restlet.js` file
   - Click **Save**
   - NetSuite will return you to the "New Script" page with your file uploaded

3. **Create the Script Record**
   - NetSuite should auto-detect the script type as "Restlet"
   - **Name**: Enter a descriptive name (e.g., "n8n RESTlet" or "Workflow Integration RESTlet")
   - **ID**: NetSuite will auto-generate this
     - Can be a custom string (e.g., `customscript_n8n_restlet`) or numeric (e.g., `1369`)
     - ✅ **Copy and save this Script ID** - you'll need it for n8n
   - **Description**: Optional description of what this RESTlet does
   - **Owner**: Select yourself or the appropriate owner
   - Click **Save**

### Step 5: Deploy the RESTlet Script

After creating the script, you must deploy it to make it accessible.

1. **Create a Deployment**
   - After saving the script, you'll see the **Deployments** subtab
   - Click **New Deployment** (or go back to the script and click **Deploy Script**)

2. **Configure the Deployment**
   - **Title**: Enter a descriptive name (e.g., "n8n Production Deployment")
   - **ID**: NetSuite will auto-generate this
     - Can be a custom string (e.g., `customdeploy_n8n_restlet`) or numeric (e.g., `1`)
     - ✅ **Copy and save this Deploy ID** - you'll need it for n8n
   - **Status**: Select **Released** (must be released to be accessible)
   - **Log Level**: Choose **Debug** for initial testing, **Error** for production
   - **Audience** subtab:
     - **Roles**: Select which roles can execute this RESTlet
       - Add the role you used in the Access Token (Step 2)
     - **Employees**: Optionally restrict to specific users

3. **Save the Deployment**
   - Click **Save**
   - Your RESTlet is now deployed and accessible via OAuth1 authentication

4. **Note Your Script Details**
   - ✅ **Script ID**: Can be custom string (e.g., `customscript_n8n_restlet`) or numeric (e.g., `1369`)
   - ✅ **Deploy ID**: Can be custom string (e.g., `customdeploy_n8n_restlet`) or numeric (e.g., `1`)
   - You can always find these by navigating back to the script record

**Important Notes:**
- The RESTlet URL will be automatically constructed by n8n using your Account ID, Script ID, and Deploy ID
- The RESTlet will only be accessible to users/roles specified in the deployment
- You can have multiple deployments of the same script (e.g., for different environments)

---

## Part 3: Security Best Practices

### Permissions and Security

1. **Use a Dedicated Integration User**
   - Create a specific NetSuite user for integrations
   - Don't use personal user accounts for automated workflows
   - Example: Create user "n8n Integration" or "API Integration"

2. **Create a Custom Role with Limited Permissions**
   - Go to **Setup > Users/Roles > Manage Roles > New**
   - Grant only the permissions needed for your integration
   - Enable the **Web Services** permission
   - Enable **RESTlet** script deployment permissions
   - Assign specific record-level permissions (View, Create, Edit, Delete) as needed

3. **Secure Your Credentials**
   - Store Consumer Key, Consumer Secret, Token ID, and Token Secret securely
   - Never commit these credentials to version control
   - Use n8n's credential storage (encrypted by default)
   - Rotate tokens periodically

4. **Monitor Access**
   - Review the **Access Tokens** page regularly
   - Check RESTlet execution logs: **Customization > Scripting > Script Deployments > View**
   - Monitor unusual activity or errors

### Token Management

- **Revoking Tokens**: Go to **Setup > Users/Roles > Access Tokens**, select the token, and click **Revoke**
- **Creating New Tokens**: If credentials are compromised, revoke the old token and create a new one
- **Multiple Tokens**: You can create multiple tokens for different n8n workflows or environments

---

## Summary: What You Need for n8n

After completing the above steps, you should have:

| Credential Field | Example Value | Where to Find |
|------------------|---------------|---------------|
| **Account ID** | `TSTDRV1234567` | Setup > Company > Company Information |
| **Realm** | `1234567_SB1` | Derived from Account ID (convert any hyphens to underscores) |
| **Consumer Key** | `abc123...` | From Integration Record (Step 1) |
| **Consumer Secret** | `xyz789...` | From Integration Record (Step 1) |
| **Token ID** | `def456...` | From Access Token (Step 2) |
| **Token Secret** | `ghi012...` | From Access Token (Step 2) |
| **Script ID** | `customscript_n8n_restlet` or `1369` | From Script Record (Step 4) |
| **Deploy ID** | `customdeploy_n8n_restlet` or `1` | From Script Deployment (Step 5) |

You'll enter all of these values when configuring the **Netsuite OAuth1 API** credentials in n8n.

---

## Configuring the Node in n8n

### Step 1: Add Credentials in n8n

1. In n8n, go to **Credentials** (in the left sidebar)
2. Click **Add Credential** and search for **Netsuite OAuth1 API**
3. Fill in the fields with the values you collected above:
   - Account ID
   - Realm (remember: convert any hyphens from the account ID to underscores)
   - Consumer Key
   - Consumer Secret
   - Token ID
   - Token Secret
   - Script ID (only required if using the RESTlet node)
   - Deploy ID (only required if using the RESTlet node)
4. Click **Save** or **Create**

### Step 2: Use the Node in a Workflow

1. Create a new workflow or open an existing one
2. Click the **+** button to add a node
3. Search for **Netsuite RESTlet**
4. Select the **Netsuite RESTlet** node
5. In the node configuration:
   - **Credentials**: Select the credentials you created in Step 1
   - **Request Body**: Enter your JSON request body
6. Execute the node to test

### Example Request Body

**Get a customer record:**
```json
{
  "action": "get",
  "recordType": "customer",
  "id": "123"
}
```

**Create a customer record:**
```json
{
  "action": "create",
  "recordType": "customer",
  "fields": {
    "companyname": "Acme Corp",
    "email": "contact@acme.com",
    "phone": "555-1234"
  }
}
```

**Update a customer record:**
```json
{
  "action": "update",
  "recordType": "customer",
  "id": "123",
  "fields": {
    "email": "newemail@acme.com"
  }
}
```

**Search for records:**
```json
{
  "action": "search",
  "recordType": "customer",
  "filters": [
    ["email", "contains", "@acme.com"]
  ],
  "columns": ["entityid", "companyname", "email"]
}
```

---

## Using the Netsuite RESTlet Node

The **Netsuite RESTlet** node uses **POST** requests to communicate with your custom RESTlet scripts. All data is sent in the request body as JSON.

Your RESTlet receives the request body and can:
- Parse the `action` field to determine what operation to perform
- Access data fields like `recordType`, `id`, `fields`, etc.
- Return a JSON response that n8n can use in subsequent nodes

This is ideal for:
- Custom business logic
- Complex operations not supported by the REST API
- Workflows requiring specific NetSuite customizations

---

## Using the Netsuite REST API Node

The **Netsuite REST API** node provides direct access to NetSuite's built-in SuiteTalk REST Web Services. This node does **NOT** require deploying RESTlet scripts in NetSuite.

### Available Operations

1. **Get Record** - Retrieve a single record by internal ID
2. **Create Record** - Create a new record
3. **Update Record** - Update an existing record
4. **Delete Record** - Delete a record
5. **Upsert Record** - Create or update a record using an external ID
6. **Search (SuiteQL)** - Query records using SQL-like syntax

### Configuration in n8n

1. Add the **Netsuite REST API** node to your workflow
2. Select your **Netsuite OAuth1 API** credentials (same as RESTlet node)
3. Choose an **Operation**
4. Configure the operation-specific fields

### Operation Examples

#### Get Record
Retrieve a customer record by ID:
- **Operation**: Get Record
- **Record Type**: `customer`
- **Record ID**: `123`
- **Additional Options**:
  - Expand Sublists: Toggle to include sublist data
  - Fields: Leave empty for all fields, or specify: `companyName,email,phone`

#### Create Record
Create a new customer:
- **Operation**: Create Record
- **Record Type**: `customer`
- **Record Data**:
```json
{
  "companyName": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "555-1234"
}
```

#### Update Record
Update an existing customer:
- **Operation**: Update Record
- **Record Type**: `customer`
- **Record ID**: `123`
- **Record Data**:
```json
{
  "email": "newemail@acme.com",
  "phone": "555-5678"
}
```

#### Delete Record
Delete a record:
- **Operation**: Delete Record
- **Record Type**: `customer`
- **Record ID**: `123`

#### Upsert Record
Create or update using external ID:
- **Operation**: Upsert Record
- **Record Type**: `customer`
- **External ID Field**: `externalId`
- **External ID Value**: `EXT-12345`
- **Record Data**:
```json
{
  "companyName": "Acme Corp",
  "email": "contact@acme.com"
}
```

If a record with `externalId = "EXT-12345"` exists, it will be updated. Otherwise, a new record is created.

#### Search (SuiteQL)
Query records using SuiteQL:
- **Operation**: Search (SuiteQL)
- **SuiteQL Query**:
```sql
SELECT id, companyname, email FROM customer WHERE email LIKE '%@acme.com' ORDER BY companyname
```
- **Additional Options**:
  - Limit: `100`
  - Offset: `0`

### Common Record Types

- `customer` - Customer records
- `salesorder` - Sales orders
- `invoice` - Invoices
- `item` - Inventory items
- `contact` - Contacts
- `vendor` - Vendors
- `employee` - Employees
- `purchaseorder` - Purchase orders

For a complete list, refer to the [NetSuite Records Browser](https://system.netsuite.com/help/helpcenter/en_US/srbrowser/Browser2023_1/schema/record/customer.html).

### When to Use REST API vs RESTlet

**Use the REST API Node when:**
- Performing standard CRUD operations on NetSuite records
- You need simple, direct access to NetSuite data
- You don't want to deploy custom scripts in NetSuite
- You're working with well-defined record types

**Use the RESTlet Node when:**
- Implementing custom business logic
- Performing complex operations spanning multiple records
- You need transaction-level control
- The standard REST API doesn't support your use case
- You have existing RESTlet scripts deployed

## Troubleshooting

### Common Issues

1. **Authentication Failed / 401 Unauthorized**
   - Verify all credential fields are correct
   - Check that the Access Token is not revoked
   - Ensure the user/role has Web Services permission
   - Verify the realm parameter has underscores (not hyphens) - convert any hyphens from account ID

2. **RESTlet Not Found / 404 Error**
   - Verify Script ID and Deploy ID are correct
   - Check that the deployment status is "Released"
   - Ensure the role in your Access Token is listed in the deployment's Audience

3. **Insufficient Permissions / 403 Forbidden**
   - Check that the user/role has permission to access the records in your RESTlet
   - Verify the role has the necessary CRUD permissions for the record types

4. **Script Error / 500 Internal Server Error**
   - Check your RESTlet's execution logs in NetSuite
   - Go to: **Customization > Scripting > Script Deployments** → Select your deployment → **View** (Execution Log)
   - Review error messages and stack traces

5. **Realm Parameter Issues**
   - The realm parameter must use underscores: `1234567_SB1` (not `1234567-SB1`)
   - NetSuite displays account IDs with hyphens in URLs, but OAuth requires underscores
   - This node automatically converts any hyphens to underscores for safety
   - If you're unsure, check your NetSuite URL and convert any hyphens to underscores

### Testing Your RESTlet

You can test your RESTlet directly in NetSuite before using it in n8n:

1. Go to your Script Deployment
2. Copy the **External URL** shown
3. Use a tool like Postman or curl to send a test POST request with OAuth1 authentication

Or use n8n's built-in testing:
1. Add the node to a workflow
2. Click **Execute Node** to test with sample data
3. Review the output to verify your RESTlet is responding correctly

---

## Compatibility

- Tested with n8n version 1.0.0+
- Compatible with NetSuite 2021.1+
- Requires NetSuite account with Token-Based Authentication enabled

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [NetSuite RESTlet documentation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_4387172221.html)
- [NetSuite OAuth 1.0 documentation](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_4389727047.html)
- [NetSuite SuiteScript 2.1 API](https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_4387799721.html)

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
