const express = require('express');
const verify = require('../verify');
const { scheduler, OC_JOB_ID, HLTB_JOB_ID } = require('../../jobs/jobs');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    // scheduler.stopById('id_2');
    // scheduler.removeById('id_1');
    const result = {
      OC_JOB_ID: scheduler.getById(OC_JOB_ID).getStatus(),
      HLTB_JOB_ID: scheduler.getById(HLTB_JOB_ID).getStatus(),
    };

    res.status(200).send(result);
  } catch (e) {
    res.status(500).json(e);
  }
});

module.exports = router;
