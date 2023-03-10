const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');
const oc = require('./oc');
const hltb = require('./hltb');

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
  run: async () => {
    const scheduler = new ToadScheduler();

    scheduler.addSimpleIntervalJob(
      new SimpleIntervalJob(
        { hours: oc.interval },
        new Task('OpenCritic Task Runner', () => {
          logDividers();
          logDividers('OPENCRITIC');
          oc.run();
        }),
        { id: 'oc_job_id' },
      ),
    );

    scheduler.addSimpleIntervalJob(
      new SimpleIntervalJob(
        { hours: hltb.interval },
        new Task('HowLongToBeat Task Runner', () => {
          logDividers();
          logDividers('HOWLONGTOBEAT');
          hltb.run();
        }),
        { id: 'hltb_job_id' },
      ),
    );

    // scheduler.stopById('id_2');
    // scheduler.removeById('id_1');
    // scheduler.getById('id_1').getStatus();
  },
};
