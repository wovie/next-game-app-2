const _ = require('lodash');
const findGames = require('./findGames');
const handleCursor = require('./handleCursor');
const hltb = require('../routes/api/hltb');

const idProp = 'howLongToBeatId';
const updatedProp = 'howLongToBeatTimeUpdated';
const interval = 5; // hours
const apiRate = 1; // requests per 5 seconds
let bucket = [];

async function getData(game) {
  if (!game) return;
  try {
    const result = await hltb.methods.getData(game);
    const { name, howLongToBeatTime } = result;
    console.log(name, howLongToBeatTime);
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
    await handleCursor(cursor, bucket, { title: 'findMissingData', idProp });

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

    // cursor = await findGames.findAll();
    // await handleCursor(cursor, bucket, { title: 'findAll' });

    console.log('HowLongToBeat bucket count:', bucket.length);

    if (bucket.length === 0) return;

    do {
      for (let i = 0; i < apiRate; i += 1) {
        getData(bucket.shift());
      }
      await new Promise((r) => setTimeout(r, 5000));
    } while (bucket.length > 0);
  },
};
