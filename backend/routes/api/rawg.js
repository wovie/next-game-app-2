const express = require('express');
const axios = require('axios');
const { RAWG_KEY } = require('../../config');
const verify = require('../verify');

const router = express.Router();
const url = 'https://api.rawg.io/api/games';

async function getGame(game) {
  const result = await axios.get(url, {
    params: {
      key: RAWG_KEY,
      ...game,
    },
  });
  return result;
}

router.post('/', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    const result = await getGame({ ...req.body });
    res.status(200).send(result.data.results);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = {
  router,
  methods: {
    getGame,
  },
};
