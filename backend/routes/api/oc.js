const express = require('express');
const axios = require('axios');
const { OPENCRITIC_KEY } = require('../../config');
const verify = require('../verify');
const games = require('./games');

const router = express.Router();
const url = 'https://opencritic-api.p.rapidapi.com/game/';
const headers = {
  'X-RapidAPI-Key': OPENCRITIC_KEY,
  'X-RapidAPI-Host': 'opencritic-api.p.rapidapi.com',
};

async function getGame(id) {
  const result = await axios.get(`${url}${id || ''}`, { headers });
  return result;
}

async function search(criteria) {
  const result = await axios.get(`${url}search`, {
    params: {
      criteria,
    },
    headers,
  });
  return result.data;
}

async function getData(game) {
  try {
    const { name } = game;
    let { openCriticId } = game;
    if (!openCriticId && name) {
      const result = await search(game.name);
      if (result && result[0] && result[0].dist === 0) {
        openCriticId = result[0].id;
      } else {
        throw new Error('Unable to determine OpenCritic ID');
      }
    }

    const result = await getGame(openCriticId);
    const { data } = result;

    return games.methods.updateGame({
      ...game,
      openCriticId: data.id,
      openCriticScore: Math.round(data.topCriticScore),
      openCriticUrl: data.url,
      openCriticScoreUpdated: Date.now(),
    });
  } catch (e) {
    throw new Error(e.response.data.message);
  }
}

async function popularGames() {
  const result = await axios.get(`${url}popular`, { headers });
  return result;
}

router.post('/data', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    const game = { ...req.body };
    const result = await getData(game);
    res.status(200).send(result);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = {
  router,
  methods: {
    getGame,
    getData,
    popularGames,
  },
};
