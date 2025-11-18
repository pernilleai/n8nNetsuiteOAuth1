/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */

/**
 * Sample NetSuite RESTlet for use with n8n-nodes-netsuite-oauth1
 *
 * This is a POST-only RESTlet (the standard NetSuite pattern) that handles
 * different operations based on the "action" field in the request body.
 *
 * Customize this script based on your specific business requirements.
 *
 * To deploy:
 * 1. Go to Customization > Scripting > Scripts > New
 * 2. Upload this file
 * 3. Create a Script Record
 * 4. Deploy the script
 * 5. Note the Script ID and Deploy ID for use in n8n
 */

define(['N/record', 'N/search', 'N/log'], (record, search, log) => {

    /**
     * Handles POST requests
     * @param {Object} context - Request body containing action and parameters
     * @returns {Object} Response data
     *
     * Expected request format:
     * {
     *   "action": "get|create|update|delete|search",
     *   "recordType": "customer",
     *   "id": "123",  // for get, update, delete
     *   "fields": {...}  // for create, update
     * }
     */
    const post = (context) => {
        try {
            log.debug('POST Request', context);

            const action = context.action || 'unknown';

            switch (action) {
                case 'get':
                    return handleGet(context);
                case 'create':
                    return handleCreate(context);
                case 'update':
                    return handleUpdate(context);
                case 'delete':
                    return handleDelete(context);
                case 'search':
                    return handleSearch(context);
                default:
                    return {
                        success: false,
                        error: `Unknown action: ${action}. Valid actions: get, create, update, delete, search`
                    };
            }

        } catch (e) {
            log.error('POST Error', e);
            return {
                success: false,
                error: e.message,
                stack: e.stack
            };
        }
    };

    /**
     * Get a record by ID
     */
    const handleGet = (context) => {
        if (!context.recordType || !context.id) {
            return {
                success: false,
                error: 'recordType and id are required for get action'
            };
        }

        const rec = record.load({
            type: context.recordType,
            id: context.id
        });

        // Get all field values
        const data = {};
        const fields = rec.getFields();
        fields.forEach(fieldId => {
            data[fieldId] = rec.getValue({ fieldId: fieldId });
        });

        return {
            success: true,
            action: 'get',
            data: {
                id: rec.id,
                type: rec.type,
                fields: data
            }
        };
    };

    /**
     * Create a new record
     */
    const handleCreate = (context) => {
        if (!context.recordType) {
            return {
                success: false,
                error: 'recordType is required for create action'
            };
        }

        const rec = record.create({
            type: context.recordType
        });

        // Set field values from context
        Object.keys(context.fields || {}).forEach(fieldId => {
            rec.setValue({
                fieldId: fieldId,
                value: context.fields[fieldId]
            });
        });

        const recordId = rec.save();

        return {
            success: true,
            action: 'create',
            message: 'Record created successfully',
            recordId: recordId
        };
    };

    /**
     * Update an existing record
     */
    const handleUpdate = (context) => {
        if (!context.recordType || !context.id) {
            return {
                success: false,
                error: 'recordType and id are required for update action'
            };
        }

        const rec = record.load({
            type: context.recordType,
            id: context.id
        });

        // Update field values from context
        Object.keys(context.fields || {}).forEach(fieldId => {
            rec.setValue({
                fieldId: fieldId,
                value: context.fields[fieldId]
            });
        });

        rec.save();

        return {
            success: true,
            action: 'update',
            message: 'Record updated successfully',
            recordId: context.id
        };
    };

    /**
     * Delete a record
     */
    const handleDelete = (context) => {
        if (!context.recordType || !context.id) {
            return {
                success: false,
                error: 'recordType and id are required for delete action'
            };
        }

        record.delete({
            type: context.recordType,
            id: context.id
        });

        return {
            success: true,
            action: 'delete',
            message: 'Record deleted successfully',
            recordId: context.id
        };
    };

    /**
     * Search for records
     */
    const handleSearch = (context) => {
        if (!context.recordType) {
            return {
                success: false,
                error: 'recordType is required for search action'
            };
        }

        const searchObj = search.create({
            type: context.recordType,
            filters: context.filters || [],
            columns: context.columns || []
        });

        const results = [];
        const maxResults = context.maxResults || 1000;

        searchObj.run().each((result) => {
            if (results.length >= maxResults) {
                return false;
            }

            const resultData = {
                id: result.id,
                type: result.recordType
            };

            // Add column values
            result.columns.forEach(column => {
                resultData[column.name] = result.getValue(column);
            });

            results.push(resultData);
            return true;
        });

        return {
            success: true,
            action: 'search',
            count: results.length,
            data: results
        };
    };

    // Only expose POST endpoint
    return {
        post: post
    };
});
