const _ = require('lodash');
const findGames = require('./findGames');
const oc = require('../routes/api/oc');
const rawg = require('../routes/api/rawg');
const games = require('../routes/api/games');

const interval = 6; // hours
const apiRate = 1; // requests per 5 seconds
let bucket = [];

async function popularGames() {
  try {
    const result = await oc.methods.popularGames();
    return result;
  } catch (e) {
    console.log(e);
    return null;
  }
}

async function getData(ocData) {
  try {
    let rawgResult = await rawg.methods.getGame({
      search: ocData.name,
      page_size: 1,
    });

    if (rawgResult.data.results && rawgResult.data.results[0]) {
      [rawgResult] = rawgResult.data.results;

      const game = {
        id: rawgResult.id,
        name: rawgResult.name,
        openCriticId: ocData.id,
        openCriticScore: Math.round(ocData.topCriticScore),
        openCriticScoreUpdated: Date.now(),
        platforms:
          _.map(rawgResult.platforms, (p) => ({ id: p.platform.id, name: p.platform.name })),
        released: rawgResult.released && Date.parse(rawgResult.released.toString()),
      };

      const result = await games.methods.addGame(game);
      console.log('ocPopular getData result:', result);
    }
  } catch (e) {
    console.log(e);
  }
}

function checkLimits(headers) {
  const limit = headers['x-ratelimit-requests-limit']; // 200
  const remaining = headers['x-ratelimit-requests-remaining']; // <200
  const buffer = 20;

  console.log('X-RateLimit-Requests-Limit:', limit);
  console.log('X-RateLimit-Requests-Remaining:', remaining);

  let check = false;
  check = (remaining > buffer);
  console.log('OpenCritic API limits check:', check);
  return check;
}

module.exports = {
  interval,
  run: async () => {
    bucket = [];

    const result = await popularGames();
    const { data, headers } = result;
    const mighty = _.filter(data, { tier: 'Mighty' });
    const cursor = findGames.findOpenCriticId(_.map(mighty, 'id'));
    const existing = await cursor.map((g) => g.openCriticId).toArray();

    mighty.forEach((r) => {
      const { id, name, topCriticScore } = r;
      if (existing.indexOf(id) === -1) {
        console.log([name, id, Math.round(topCriticScore)].join(', '));
        bucket.push(r);
      }
    });

    console.log('OpenCritic Popular bucket count:', bucket.length);

    if (bucket.length === 0) return;

    if (!checkLimits(headers)) return;

    do {
      for (let i = 0; i < apiRate; i += 1) {
        getData(bucket.pop());
      }
      await new Promise((r) => setTimeout(r, 5000));
    } while (bucket.length > 0);
  },
};
