const mdb = require('../db/mdb');

const epochDay = (1000 * 60 * 60 * 24);

module.exports = {
  findMissingData: (prop) => {
    const query = { released: { $lt: Date.now() } };
    query[prop] = { $exists: false };

    const games = mdb.getCollection('games');
    return games.find(query).sort({ released: -1 });
  },

  findReleasedDateRange: (params) => {
    const { beginDays, endDays, tresholdDays, updatedProp } = params;
    const begin = beginDays * epochDay;
    const end = endDays * epochDay;
    const threshold = tresholdDays * epochDay;
    const now = Date.now();

    const query = {
      released: { $lte: now - begin, $gte: now - end },
    };
    query[updatedProp] = { $exists: true, $lte: now - threshold };

    const games = mdb.getCollection('games');
    return games.find(query).sort({ released: -1 });
  },

  findOpenCriticId: (ids) => {
    const query = { openCriticId: { $in: ids } };

    const games = mdb.getCollection('games');
    return games.find(query).sort({ released: -1 });
  },
};
