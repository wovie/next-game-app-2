const express = require('express');
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

    const { scheduler, openCriticJob, howLongToBeatJob, timestamp } = status;

    if (!scheduler) throw new Error('Scheduler not started');

    const result = {
      openCriticJob: {
        status: scheduler.getById(openCriticJob.id).getStatus(),
        nextRun: nextRun(openCriticJob.interval, timestamp),
      },
      howLongToBeatJob: {
        status: scheduler.getById(howLongToBeatJob.id).getStatus(),
        nextRun: nextRun(howLongToBeatJob.interval, timestamp),
      },
    };

    res.status(200).send(result);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
