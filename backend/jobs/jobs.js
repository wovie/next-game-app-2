const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');
const oc = require('./oc');
const hltb = require('./hltb');

const OC_JOB_ID = 'oc_job_id';
const HLTB_JOB_ID = 'hltb_job_id';
const status = {
  scheduler: null,
  timestamp: null,
  openCriticJob: {
    id: OC_JOB_ID,
    interval: oc.interval,
  },
  howLongToBeatJob: {
    id: HLTB_JOB_ID,
    interval: hltb.interval,
  },
};

function logDividers(title) {
  const length = (60 - (title ? title.length + 2 : 0));
  let stars = '';
  for (let i = 0; i < length / 2; i += 1) stars += '*';
  console.log([
    stars,
    (title ? ` ${title} ` : ''),
    stars,
  ].join(''));
}

module.exports = {
  status,
  run: async () => {
    status.scheduler = new ToadScheduler();
    status.timestamp = Date.now();

    status.scheduler.addSimpleIntervalJob(
      new SimpleIntervalJob(
        { hours: oc.interval },
        new Task('OpenCritic Task Runner', () => {
          logDividers();
          logDividers('OPENCRITIC');
          oc.run();
        }),
        { id: OC_JOB_ID },
      ),
    );

    status.scheduler.addSimpleIntervalJob(
      new SimpleIntervalJob(
        { hours: hltb.interval },
        new Task('HowLongToBeat Task Runner', () => {
          logDividers();
          logDividers('HOWLONGTOBEAT');
          hltb.run();
        }),
        { id: HLTB_JOB_ID },
      ),
    );
  },
};
