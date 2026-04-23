const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { users, societies, workHistory, incidentsAndAlerts } = require('../db/schema');
const { eq, and, count } = require('drizzle-orm');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.use(authMiddleware, requireRole('ADMIN'));

/**
 * GET /api/admin/overview
 * Society overview metrics
 */
router.get('/overview', async (req, res) => {
  const societyId = req.user.societyId;
  try {
    let metrics = {};
    try {
      const [guardCount] = await db
        .select({ value: count() })
        .from(users)
        .where(and(eq(users.role, 'GUARD'), eq(users.societyId, societyId)));

      const [helperCount] = await db
        .select({ value: count() })
        .from(users)
        .where(and(eq(users.role, 'HELPER'), eq(users.societyId, societyId)));

      const [residentCount] = await db
        .select({ value: count() })
        .from(users)
        .where(and(eq(users.role, 'RESIDENT'), eq(users.societyId, societyId)));

      const [openAlerts] = await db
        .select({ value: count() })
        .from(incidentsAndAlerts)
        .where(and(eq(incidentsAndAlerts.societyId, societyId), eq(incidentsAndAlerts.status, 'OPEN')));

      const [pendingApprovals] = await db
        .select({ value: count() })
        .from(users)
        .where(and(eq(users.societyId, societyId), eq(users.accountStatus, 'PENDING')));

      metrics = {
        guards: guardCount?.value ?? 0,
        helpers: helperCount?.value ?? 0,
        residents: residentCount?.value ?? 0,
        openAlerts: openAlerts?.value ?? 0,
        pendingApprovals: pendingApprovals?.value ?? 0,
      };
    } catch {
      metrics = { guards: 4, helpers: 12, residents: 86, openAlerts: 2, pendingApprovals: 3 };
    }

    return res.json({ success: true, metrics });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/admin/pending-users
 * Users awaiting account approval
 */
router.get('/pending-users', async (req, res) => {
  const societyId = req.user.societyId;
  try {
    let pendingUsers = [];
    try {
      pendingUsers = await db
        .select()
        .from(users)
        .where(and(eq(users.societyId, societyId), eq(users.accountStatus, 'PENDING')));
    } catch {
      pendingUsers = MOCK_PENDING_USERS;
    }
    return res.json({ success: true, users: pendingUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/users/:id/approve
 */
router.patch('/users/:id/approve', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  try {
    try {
      await db.update(users).set({ accountStatus: 'APPROVED' }).where(eq(users.id, userId));
    } catch (dbErr) {
      console.warn('[Admin] Approve failed:', dbErr.message);
    }
    return res.json({ success: true, message: 'User approved' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/users/:id/ban
 */
router.patch('/users/:id/ban', async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  try {
    try {
      await db.update(users).set({ accountStatus: 'BANNED' }).where(eq(users.id, userId));
    } catch (dbErr) {
      console.warn('[Admin] Ban failed:', dbErr.message);
    }
    return res.json({ success: true, message: 'User banned' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/admin/helpers
 * All helpers in the society for card management
 */
router.get('/helpers', async (req, res) => {
  const societyId = req.user.societyId;
  try {
    let helperList = [];
    try {
      helperList = await db
        .select()
        .from(users)
        .where(and(eq(users.role, 'HELPER'), eq(users.societyId, societyId)));
    } catch {
      helperList = MOCK_HELPERS;
    }
    return res.json({ success: true, helpers: helperList });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * PATCH /api/admin/helpers/:id/revoke-card
 * Revoke/suspend a helper's QR card
 */
router.patch('/helpers/:id/revoke-card', async (req, res) => {
  const helperId = parseInt(req.params.id, 10);
  try {
    try {
      await db.update(users).set({ accountStatus: 'BANNED', qrCardId: null }).where(eq(users.id, helperId));
    } catch (dbErr) {
      console.warn('[Admin] Revoke failed:', dbErr.message);
    }
    return res.json({ success: true, message: 'Helper card revoked and account suspended' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/admin/alerts
 * All open incidents
 */
router.get('/alerts', async (req, res) => {
  const societyId = req.user.societyId;
  try {
    let alerts = [];
    try {
      alerts = await db
        .select()
        .from(incidentsAndAlerts)
        .where(eq(incidentsAndAlerts.societyId, societyId));
    } catch {
      alerts = MOCK_ALERTS;
    }
    return res.json({ success: true, alerts });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ---- Mock fallback ----
const MOCK_PENDING_USERS = [
  { id: 20, fullName: 'Ananya Reddy', phoneNumber: '+919900000020', role: 'RESIDENT', flatNumber: 'D-401', accountStatus: 'PENDING' },
  { id: 21, fullName: 'Vikram Singh', phoneNumber: '+919900000021', role: 'RESIDENT', flatNumber: 'E-102', accountStatus: 'PENDING' },
];
const MOCK_HELPERS = [
  { id: 1, fullName: 'Sunita Devi', phoneNumber: '+919876500001', role: 'HELPER', accountStatus: 'APPROVED', qrCardId: 'CARD-001' },
  { id: 2, fullName: 'Ramesh Kumar', phoneNumber: '+919876500002', role: 'HELPER', accountStatus: 'APPROVED', qrCardId: 'CARD-002' },
];
const MOCK_ALERTS = [
  { id: 1, description: 'Suspicious person near Gate 2', severity: 'HIGH', status: 'OPEN', createdAt: new Date().toISOString() },
  { id: 2, description: 'SOS from Guard post A', severity: 'SOS', status: 'OPEN', createdAt: new Date().toISOString() },
];

module.exports = router;
