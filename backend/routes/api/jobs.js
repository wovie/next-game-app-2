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
  return `${Math.floor(hours)} hours ${Math.floor(minutes)} minutes`;
}

router.get('/', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    // scheduler.stopById('id_2');
    // scheduler.removeById('id_1');

    const { scheduler, timestamp, ...jobs } = status;

    if (!scheduler) throw new Error('Scheduler not started');

    res.status(200).send(_.map(jobs, (j) => ({
      id: j.id,
      status: scheduler.getById(j.id).getStatus(),
      nextRun: nextRun(j.interval, timestamp),
    })));
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
