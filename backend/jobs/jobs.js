const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');
const oc = require('./oc');
const hltb = require('./hltb');
const ocPopular = require('./ocPopular');
const ocMighty = require('./ocMighty');

const status = {
  scheduler: null,
  timestamp: null,
  jobs: [
    { id: 'oc_fill_update', module: oc, description: 'Fill and update OpenCritic data' },
    { id: 'hltb_fill_update', module: hltb, description: 'Fill and update HowLongToBeat data' },
    { id: 'oc_popular', module: ocPopular, description: 'Add popular games' },
    { id: 'oc_mighty', module: ocMighty, description: 'Add Mighty (84+) games' },
  ],
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

    status.jobs.forEach((j) => {
      const { id, module } = j;

      status.scheduler.addSimpleIntervalJob(
        new SimpleIntervalJob(
          { hours: module.interval },
          new Task(`${id}`, () => {
            logDividers();
            logDividers(id);
            module.run();
          }),
          { id },
        ),
      );

      console.log(`Added ${id}, running every ${module.interval} hours`);
    });
  },
};
