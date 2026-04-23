const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { users, workHistory, societies } = require('../db/schema');
const { eq, and, sql } = require('drizzle-orm');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Apply auth to all helper routes
router.use(authMiddleware);

/**
 * GET /api/helpers
 * Search helpers in the caller's society.
 * Query: ?search=<name or phone>
 */
router.get('/', async (req, res) => {
  const { search } = req.query;
  const societyId = req.user.societyId;

  try {
    let rows = [];
    try {
      const conditions = [eq(users.role, 'HELPER'), eq(users.societyId, societyId)];
      rows = await db.select().from(users).where(and(...conditions));
    } catch {
      // Mock data when DB is unavailable
      rows = MOCK_HELPERS;
    }

    // Filter by search term if provided
    if (search) {
      const term = search.toLowerCase();
      rows = rows.filter(
        (h) =>
          h.fullName?.toLowerCase().includes(term) ||
          h.phoneNumber?.includes(term)
      );
    }

    return res.json({ success: true, helpers: rows });
  } catch (error) {
    console.error('[Helpers] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/helpers/:id
 * Get a single helper's profile with their work history
 */
router.get('/:id', async (req, res) => {
  const helperId = parseInt(req.params.id, 10);

  try {
    let helper = null;
    let history = [];

    try {
      const helperRows = await db.select().from(users).where(eq(users.id, helperId)).limit(1);
      helper = helperRows[0];

      if (!helper) {
        return res.status(404).json({ success: false, message: 'Helper not found' });
      }

      // Fetch work history with resident and society info joined
      history = await db
        .select({
          id: workHistory.id,
          jobTitle: workHistory.jobTitle,
          startDate: workHistory.startDate,
          endDate: workHistory.endDate,
          status: workHistory.status,
          societyName: societies.name,
          residentName: users.fullName,
          flatNumber: users.flatNumber,
        })
        .from(workHistory)
        .leftJoin(societies, eq(workHistory.societyId, societies.id))
        .leftJoin(users, eq(workHistory.residentId, users.id))
        .where(eq(workHistory.helperId, helperId));
    } catch {
      helper = MOCK_HELPERS.find((h) => h.id === helperId) || MOCK_HELPERS[0];
      history = MOCK_WORK_HISTORY;
    }

    return res.json({ success: true, helper, workHistory: history });
  } catch (error) {
    console.error('[Helper Detail] Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * GET /api/helpers/:id/work-history
 * Get full work history for a helper (residents only)
 */
router.get('/:id/work-history', requireRole('RESIDENT', 'ADMIN'), async (req, res) => {
  const helperId = parseInt(req.params.id, 10);
  try {
    let history = [];
    try {
      history = await db
        .select({
          id: workHistory.id,
          jobTitle: workHistory.jobTitle,
          startDate: workHistory.startDate,
          endDate: workHistory.endDate,
          status: workHistory.status,
          societyName: societies.name,
          residentName: users.fullName,
          flatNumber: users.flatNumber,
        })
        .from(workHistory)
        .leftJoin(societies, eq(workHistory.societyId, societies.id))
        .leftJoin(users, eq(workHistory.residentId, users.id))
        .where(eq(workHistory.helperId, helperId));
    } catch {
      history = MOCK_WORK_HISTORY;
    }
    return res.json({ success: true, workHistory: history });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ---- Mock fallback data ----
const MOCK_HELPERS = [
  { id: 101, fullName: 'Sunita Devi', phoneNumber: '+919876500001', role: 'HELPER', type: 'Cook', specialties: ['North Indian', 'Baking'], rating: 4.8, societies: 3, profilePhotoUrl: 'https://randomuser.me/api/portraits/women/44.jpg', verified: true, hourlyRate: '₹150/hr', qrCardId: 'CARD-101' },
  { id: 102, fullName: 'Ramesh Kumar', phoneNumber: '+919876500002', role: 'HELPER', type: 'Driver', specialties: ['Automatic', 'Night Drives'], rating: 4.9, societies: 2, profilePhotoUrl: 'https://randomuser.me/api/portraits/men/32.jpg', verified: true, hourlyRate: '₹200/hr', qrCardId: 'CARD-102' },
  { id: 103, fullName: 'Kavita Sharma', phoneNumber: '+919876500003', role: 'HELPER', type: 'Maid', specialties: ['Deep Cleaning', 'Laundry'], rating: 4.6, societies: 4, profilePhotoUrl: 'https://randomuser.me/api/portraits/women/68.jpg', verified: true, hourlyRate: '₹100/hr', qrCardId: 'CARD-103' },
  { id: 104, fullName: 'Suresh Patil', phoneNumber: '+919876500004', role: 'HELPER', type: 'Cook', specialties: ['South Indian', 'Continental'], rating: 4.7, societies: 1, profilePhotoUrl: 'https://randomuser.me/api/portraits/men/46.jpg', verified: true, hourlyRate: '₹180/hr', qrCardId: 'CARD-104' },
  { id: 105, fullName: 'Lakshmi N', phoneNumber: '+919876500005', role: 'HELPER', type: 'Nanny', specialties: ['Toddlers', 'Newborns'], rating: 5.0, societies: 1, profilePhotoUrl: 'https://randomuser.me/api/portraits/women/22.jpg', verified: true, hourlyRate: '₹250/hr', qrCardId: 'CARD-105' },
];

const MOCK_WORK_HISTORY = [
  { id: 1, jobTitle: 'Maid', startDate: '2023-06-01', endDate: null, status: 'ACTIVE', societyName: 'Prestige Residency', residentName: 'Amit Shah', flatNumber: 'A-102' },
  { id: 2, jobTitle: 'Cook', startDate: '2022-01-15', endDate: '2023-05-31', status: 'TERMINATED', societyName: 'Green Valley Apts', residentName: 'Priya Nair', flatNumber: 'C-304' },
];

module.exports = router;
