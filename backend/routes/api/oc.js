const express = require('express');
const axios = require('axios');
const _ = require('lodash');
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
    const { openCriticId } = game;
    const result = await getGame(openCriticId);
    const { data } = result;

    game = {
      ...game,
      openCriticScore: Math.round(data.topCriticScore),
      openCriticScoreUpdated: Date.now(),
      openCriticUrl: data.url,
      platforms: _.map(data.Platforms, (p) => ({
        name: p.name,
        shortName: p.shortName,
        id: p.id,
      })),
      released: Date.parse(data.firstReleaseDate),
    };

    await games.methods.updateGame(game);
    return game;
  } catch (e) {
    throw new Error(e.response.data.message || e.response.data.messages);
  }
}

async function popularGames() {
  const result = await axios.get(`${url}popular`, { headers });
  return result;
}

async function mightyGames(skip) {
  const result = await axios.get(`${url}`, {
    headers,
    params: {
      sort: 'score',
      skip,
      platforms: 'pc,switch,ps5',
    },
  });
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

router.get('/limits', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    const result = await getGame();
    const searchesLimit = result.headers['x-ratelimit-searches-limit'];
    const searchesRemaining = result.headers['x-ratelimit-searches-remaining'];
    const requestsLimit = result.headers['x-ratelimit-requests-limit'];
    const requestsRemaining = result.headers['x-ratelimit-requests-remaining'];
    const reset = result.headers['x-ratelimit-requests-reset'];
    res.status(200).send({
      searchesLimit,
      searchesRemaining,
      requestsLimit,
      requestsRemaining,
      reset,
    });
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.get('/search', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    const result = await search(req.query.criteria);
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
    mightyGames,
  },
};
