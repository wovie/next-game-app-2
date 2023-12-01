const findGames = require('./findGames');
const handleCursor = require('./handleCursor');
const oc = require('../routes/api/oc');

const idProp = 'openCriticId';
const updatedProp = 'openCriticScoreUpdated';
const urlProp = 'openCriticUrl';
const interval = 6; // hours
const apiRate = 1; // requests per 5 seconds
let bucket = [];

async function checkLimits() {
  try {
    const result = await oc.methods.getGame();
    const { headers } = result;
    const limit = headers['x-ratelimit-requests-limit'];
    const remaining = headers['x-ratelimit-requests-remaining'];
    const reset = headers['x-ratelimit-requests-reset'];
    const buffer = 20;

    console.log('X-RateLimit-Requests-Limit:', limit);
    console.log('X-RateLimit-Requests-Remaining:', remaining);
    console.log('X-RateLimit-Requests-Reset:', reset);

    const check = (remaining > buffer);
    console.log('OpenCritic API limits check:', check);
    return check;
  } catch (e) {
    console.log(e.response.data.message);
    return e;
  }
}

async function getData(game) {
  if (!game) return;
  try {
    const result = await oc.methods.getData(game);
    console.log('oc getData result:', result);
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  interval,
  run: async () => {
    bucket = [];
    let cursor;

    cursor = await findGames.findMissingData(idProp);
    bucket = await handleCursor(cursor, bucket, { title: 'findMissingData', idProp });

    cursor = await findGames.findMissingData(urlProp);
    bucket = await handleCursor(cursor, bucket, { title: 'findMissingData', urlProp });

    const dateRangeQueries = [
      { beginDays: 0, endDays: 14, tresholdDays: 1, updatedProp },
      { beginDays: 15, endDays: 30, tresholdDays: 3, updatedProp },
      { beginDays: 31, endDays: 93, tresholdDays: 6, updatedProp },
      { beginDays: 94, endDays: 282, tresholdDays: 30, updatedProp },
    ];
    for await (const q of dateRangeQueries) {
      cursor = await findGames.findReleasedDateRange(q);
      bucket = await handleCursor(cursor, bucket, { title: 'findReleasedDateRange', ...q });
    }

    console.log('OpenCritic bucket count:', bucket.length);

    if (bucket.length === 0) return;

    if (!await checkLimits()) return;

    do {
      await new Promise((r) => setTimeout(r, 5000));
      for (let i = 0; i < apiRate; i += 1) {
        getData(bucket.shift());
      }
    } while (bucket.length > 0);
  },
};
