const _ = require('lodash');
const { ObjectId } = require('mongodb');
const mdb = require('../db/mdb');
const games = require('../api/games');
const blacklist = require('../api/blacklist');

const epochDay = (1000 * 60 * 60 * 24);

module.exports = {
  findMissingData: async (prop) => {
    const bl = await blacklist.methods.getBlacklist();
    const nin = _.map(bl, (item) => new ObjectId(item.id));

    const query = { released: { $lt: Date.now() } };
    query[prop] = { $exists: false };
    query._id = { $nin: nin };

    const collection = mdb.getCollection('games');
    return collection.find(query).sort({ released: -1 });
  },

  findReleasedDateRange: async (params) => {
    const { beginDays, endDays, tresholdDays, updatedProp } = params;
    const begin = beginDays * epochDay;
    const end = endDays * epochDay;
    const threshold = tresholdDays * epochDay;
    const now = Date.now();

    const bl = await blacklist.methods.getBlacklist();
    const nin = _.map(bl, (item) => new ObjectId(item.id));

    const query = {
      released: { $lte: now - begin, $gte: now - end },
    };
    query[updatedProp] = { $exists: true, $lte: now - threshold };
    query._id = { $nin: nin };

    const collection = mdb.getCollection('games');
    return collection.find(query).sort({ released: -1 });
  },

  findOpenCriticId: (ids) => {
    const query = { openCriticId: { $in: ids } };

    const collection = mdb.getCollection('games');
    return collection.find(query).sort({ released: -1 });
  },

  findAll: () => games.methods.getGames(),
};
