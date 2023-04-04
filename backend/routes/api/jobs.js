const express = require('express');
const _ = require('lodash');
const verify = require('../verify');
const { status } = require('../../jobs/jobs');

const router = express.Router();

function nextRun(interval, timestamp) {
  const percent = (
    (Date.now() - timestamp) / (interval * (60 * 60 * 1000))
  ) % 1;
  const hours = ((100 - (percent * 100)) * interval) / 100;
  const minutes = (hours % 1) * 60;
  return `${Math.floor(hours)}h ${Math.floor(minutes)}m`;
}

router.get('/', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    const { scheduler, timestamp, jobs } = status;

    if (!scheduler) throw new Error('Scheduler not started');

    res.status(200).send(_.map(jobs, (j) => ({
      id: j.id,
      status: scheduler.getById(j.id).getStatus(),
      nextRun: nextRun(j.module.interval, timestamp),
      description: j.description,
    })));
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    const { jobs } = status;
    const { id } = req.body;

    const job = _.find(jobs, { id });

    if (job) job.module.run();

    res.status(200);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
