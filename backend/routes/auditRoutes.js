import express from 'express';
import {
    getAuditLogs,
    getAuditLogDetail,
    getAuditAnalytics,
    exportAuditLogs,
} from '../controllers/auditController.js';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';
import { roleCheckMiddleware } from '../middlewares/roleCheckMiddleware.js';
import { captureAuditContext } from '../middlewares/auditMiddleware.js';

const router = express.Router();

// Apply authentication and audit context capture to all routes
router.use(verifyAccessTokenMiddleware);
router.use(captureAuditContext);
router.use(roleCheckMiddleware);

/**
 * GET /api/v1/admin/audit-logs
 * Fetch audit logs with filters and pagination
 */
router.get('/', getAuditLogs);

/**
 * GET /api/v1/admin/audit-logs/:id
 * Fetch single audit log details
 */
router.get('/:id', getAuditLogDetail);

/**
 * GET /api/v1/admin/audit-logs/analytics
 * Get analytics and statistics
 */
router.get('/analytics/data', getAuditAnalytics);

/**
 * POST /api/v1/admin/audit-logs/export
 * Export audit logs in CSV or JSON format
 */
router.post('/export', exportAuditLogs);

export default router;
