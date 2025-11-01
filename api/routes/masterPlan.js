const express = require('express');
const router = express.Router();
const masterPlanService = require('../services/masterPlanService');

router.get('/', async (req, res, next) => {
  try {
    const masterPlan = await masterPlanService.get();

    if (!masterPlan) {
      return res.status(404).json({ error: 'Master Plan not found' });
    }

    res.json(masterPlan);
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const updated = await masterPlanService.update(req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
