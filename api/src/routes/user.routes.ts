import { Router } from 'express';

const router = Router();

// GET /api/users/me - profile summary (stub)
router.get('/me', async (req, res) => {
  try {
    // TODO: derive from auth context/JWT
    return res.json({
      userId: 'demo-user',
      name: 'Demo User',
      level: 3,
      xp: 420,
      streak: 5,
      premium: false,
    });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to fetch profile' });
  }
});

// POST /api/users/export - request GDPR data export (stub)
router.post('/export', async (req, res) => {
  try {
    // TODO: enqueue export job
    return res.json({ status: 'queued', jobId: `job_${Date.now()}` });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to queue export' });
  }
});

// DELETE /api/users/me - account deletion (stub)
router.delete('/me', async (req, res) => {
  try {
    // TODO: enqueue deletion flow
    return res.json({ deleted: true, at: new Date().toISOString() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to delete account' });
  }
});

export default router;
