const _ = require('lodash');
const findGames = require('./findGames');
const oc = require('../api/oc');
const games = require('../api/games');
const hltb = require('../api/hltb');

const interval = 47; // hours
const apiRate = 1; // requests per 5 seconds
let bucket = [];

async function mightyGames(skip) {
  try {
    const result = await oc.methods.mightyGames(skip);
    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function addGame(ocData) {
  try {
    const {
      topCriticScore,
      name,
      Platforms,
      id,
      firstReleaseDate,
      url,
    } = ocData;

    const game = {
      name,
      openCriticId: id,
      openCriticScore: Math.round(topCriticScore),
      openCriticScoreUpdated: Date.now(),
      openCriticUrl: url,
      platforms: _.map(Platforms, (p) => ({
        name: p.name,
        shortName: p.shortName,
        id: p.id,
      })),
      released: Date.parse(firstReleaseDate),
    };

    const result = await games.methods.addGame(game);
    game._id = result.upsertedId;
    await hltb.methods.getData(game);
    console.log('ocMighty addGame result:', { ...result, name });
  } catch (e) {
    console.log(e);
  }
}

function checkLimits(headers) {
  const remaining = headers['x-ratelimit-requests-remaining'];
  const buffer = 20;

  return remaining > buffer;
}

module.exports = {
  interval,
  run: async () => {
    try {
      bucket = [];

      let skip = 0;

      do {
        const result = await mightyGames(skip);
        const { data, headers } = result;
        const mighty = _.filter(data, { tier: 'Mighty' });
        const cursor = findGames.findOpenCriticId(_.map(mighty, 'id'));
        const existing = await cursor.map((g) => g.openCriticId).toArray();

        // eslint-disable-next-line no-loop-func
        mighty.forEach((r) => {
          const { id } = r;
          if (existing.indexOf(id) === -1) {
            bucket.push(r);
          }
        });

        skip = mighty.length > 0 && checkLimits(headers) ? skip + 20 : -1;

        await new Promise((r) => setTimeout(r, 1000));
      } while (skip >= 0);

      console.log('OpenCritic Mighty bucket count:', bucket.length);

      if (bucket.length === 0) return;

      do {
        for (let i = 0; i < apiRate; i += 1) {
          addGame(bucket.shift());
        }
        await new Promise((r) => setTimeout(r, 5000));
      } while (bucket.length > 0);
    } catch (e) {
      console.log(e);
    }
  },
};
