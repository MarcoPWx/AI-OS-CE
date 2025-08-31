import { Router } from 'express';

const router = Router();

// POST /api/analytics/event - minimal ingestion stub
router.post('/event', async (req, res) => {
  try {
    const { event, properties, userId } = req.body || {};
    // TODO: persist to data store / analytics pipeline
    return res.json({ received: true, event, userId, ts: new Date().toISOString() });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'Failed to ingest event' });
  }
});

export default router;
