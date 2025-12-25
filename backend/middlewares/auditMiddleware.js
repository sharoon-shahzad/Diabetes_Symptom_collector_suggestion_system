import AuditService from '../services/auditService.js';

/**
 * Middleware to capture and log audit information
 * Attaches audit data to the request for later use
 */
export const captureAuditContext = (req, res, next) => {
    // Capture user information
    req.auditContext = {
        user_id: req.user?._id,
        user_email: req.user?.email,
        user_role: req.user?.roles || ['user'],
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('user-agent') || 'Unknown',
        timestamp: new Date(),
    };

    next();
};

/**
 * Middleware to log audit action after response is sent
 * Usage: auditLog('CREATE', 'Disease', req, res)
 */
export const createAuditLog = async (action, resource, req, res, resourceId = null, changes = null) => {
    try {
        if (!req.auditContext) {
            console.warn('Audit context not found in request');
            return;
        }

        const auditData = {
            user_id: req.auditContext.user_id,
            user_email: req.auditContext.user_email,
            user_role: req.auditContext.user_role,
            action,
            resource,
            resource_id: resourceId || null,
            changes,
            ip_address: req.auditContext.ip_address,
            user_agent: req.auditContext.user_agent,
            status: res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
            error_message: res.statusCode >= 400 ? res.locals.errorMessage || 'Unknown error' : null,
            involves_pii: ['User', 'UserMedicalInfo', 'UserPersonalInfo'].includes(resource),
            involves_phi: ['UserMedicalInfo', 'Assessment', 'DietPlan'].includes(resource),
        };

        await AuditService.logAction(auditData);
    } catch (error) {
        console.error('Error creating audit log:', error.message);
        // Don't throw - audit logging shouldn't break the main operation
    }
};

/**
 * Higher-order function to wrap route handlers and auto-log audits
 */
export const auditRoute = (action, resource, shouldCaptureChanges = false) => {
    return async (req, res, next) => {
        // Store original JSON method to capture response data
        const originalJson = res.json.bind(res);

        res.json = function (data) {
            // Capture changes if needed
            let changes = null;
            if (shouldCaptureChanges) {
                changes = {
                    before: req.body?.before || null,
                    after: data || {},
                    fields_modified: shouldCaptureChanges === true ? Object.keys(req.body || {}) : shouldCaptureChanges,
                };
            }

            // Log the audit after sending response
            createAuditLog(
                action,
                resource,
                req,
                res,
                data?._id || req.params.id || null,
                changes
            ).catch((err) => console.error('Audit logging error:', err));

            return originalJson(data);
        };

        next();
    };
};

/**
 * Middleware for tracking user login/logout
 */
export const auditAuthentication = async (action, req, res) => {
    try {
        const auditData = {
            user_id: req.user?._id || null,
            user_email: req.body?.email || req.user?.email || 'Unknown',
            user_role: req.user?.roles || ['user'],
            action,
            resource: 'User',
            resource_id: req.user?._id || null,
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('user-agent') || 'Unknown',
            status: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
            error_message: res.statusCode < 400 ? null : 'Authentication failed',
            involves_pii: false,
            involves_phi: false,
        };

        await AuditService.logAction(auditData);
    } catch (error) {
        console.error('Error logging authentication audit:', error.message);
    }
};

/**
 * Middleware to track permission/role changes
 */
export const auditPermissionChange = async (userId, userEmail, userRoles, action, changes, req) => {
    try {
        const auditData = {
            user_id: userId,
            user_email: userEmail,
            user_role: userRoles,
            action,
            resource: 'Permission',
            resource_id: null,
            changes,
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('user-agent') || 'Unknown',
            status: 'SUCCESS',
            error_message: null,
            involves_pii: false,
            involves_phi: false,
        };

        await AuditService.logAction(auditData);
    } catch (error) {
        console.error('Error logging permission change audit:', error.message);
    }
};

/**
 * Middleware for data export operations
 */
export const auditExport = async (user_id, user_email, user_roles, exportFormat, resourceType, recordCount, req) => {
    try {
        const auditData = {
            user_id,
            user_email,
            user_role: user_roles,
            action: 'EXPORT',
            resource: resourceType,
            resource_id: null,
            changes: {
                before: null,
                after: {
                    format: exportFormat,
                    record_count: recordCount,
                },
                fields_modified: ['format', 'record_count'],
            },
            ip_address: req.ip || req.connection.remoteAddress,
            user_agent: req.get('user-agent') || 'Unknown',
            status: 'SUCCESS',
            error_message: null,
            involves_pii: resourceType === 'User' || resourceType === 'UserMedicalInfo',
            involves_phi: resourceType === 'UserMedicalInfo',
        };

        await AuditService.logAction(auditData);
    } catch (error) {
        console.error('Error logging export audit:', error.message);
    }
};

export default {
    captureAuditContext,
    createAuditLog,
    auditRoute,
    auditAuthentication,
    auditPermissionChange,
    auditExport,
};
