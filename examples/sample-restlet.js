/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */

/**
 * Sample NetSuite RESTlet for use with n8n-nodes-netsuite-oauth1
 *
 * This is a basic example that demonstrates how to handle different HTTP methods.
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
     * Handles GET requests
     * @param {Object} context - Request parameters
     * @returns {Object} Response data
     */
    const get = (context) => {
        try {
            log.debug('GET Request', context);

            // Example: Search for a record
            if (context.recordType && context.id) {
                const rec = record.load({
                    type: context.recordType,
                    id: context.id
                });

                return {
                    success: true,
                    data: {
                        id: rec.id,
                        type: rec.type,
                        // Add more fields as needed
                    }
                };
            }

            return {
                success: true,
                message: 'GET request received',
                data: context
            };

        } catch (e) {
            log.error('GET Error', e);
            return {
                success: false,
                error: e.message
            };
        }
    };

    /**
     * Handles POST requests
     * @param {Object} context - Request body
     * @returns {Object} Response data
     */
    const post = (context) => {
        try {
            log.debug('POST Request', context);

            // Example: Create a new record
            if (context.recordType) {
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
                    message: 'Record created successfully',
                    recordId: recordId
                };
            }

            return {
                success: true,
                message: 'POST request received',
                data: context
            };

        } catch (e) {
            log.error('POST Error', e);
            return {
                success: false,
                error: e.message
            };
        }
    };

    /**
     * Handles PUT requests
     * @param {Object} context - Request body
     * @returns {Object} Response data
     */
    const put = (context) => {
        try {
            log.debug('PUT Request', context);

            // Example: Update an existing record
            if (context.recordType && context.id) {
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
                    message: 'Record updated successfully'
                };
            }

            return {
                success: true,
                message: 'PUT request received',
                data: context
            };

        } catch (e) {
            log.error('PUT Error', e);
            return {
                success: false,
                error: e.message
            };
        }
    };

    /**
     * Handles DELETE requests
     * @param {Object} context - Request parameters
     * @returns {Object} Response data
     */
    const _delete = (context) => {
        try {
            log.debug('DELETE Request', context);

            // Example: Delete a record
            if (context.recordType && context.id) {
                record.delete({
                    type: context.recordType,
                    id: context.id
                });

                return {
                    success: true,
                    message: 'Record deleted successfully'
                };
            }

            return {
                success: true,
                message: 'DELETE request received',
                data: context
            };

        } catch (e) {
            log.error('DELETE Error', e);
            return {
                success: false,
                error: e.message
            };
        }
    };

    return {
        get: get,
        post: post,
        put: put,
        delete: _delete
    };
});
