const express = require('express');
const axios = require('axios');
const verify = require('../verify');
const games = require('./games');
const { ISTHEREANYDEAL_KEY } = require('../../config');

const router = express.Router();
const url = 'https://api.isthereanydeal.com/';
const key = ISTHEREANYDEAL_KEY;

async function getData(game) {
  try {
    const { name } = game;
    let { isThereAnyDealId } = game;

    if (!isThereAnyDealId) {
      const result = await axios.get(`${url}v02/search/search/`, {
        params: {
          key,
          q: name,
        },
      });

      const { results } = result.data.data;
      const { plain } = results.length > 0 && results[0];
      if (!plain) {
        throw new Error(`Unable to determine IsThereAnyDeal ID for: ${name}`);
      }

      isThereAnyDealId = plain;
    }

    const result = await axios.get(`${url}v01/game/lowest/`, {
      params: {
        key,
        plains: isThereAnyDealId,
        region: 'us',
        country: 'US',
      },
    });

    const data = result.data.data[isThereAnyDealId];
    const { cut, price, urls } = data;

    const update = {
      ...game,
      isThereAnyDealId,
      isThereAnyDealPrice: {
        cut,
        price,
      },
      isThereAnyDealPriceUpdated: Date.now(),
      isThereAnyDealUrl: urls.game,
    };

    const updated = await games.methods.updateGame(update);

    if (!updated.acknowledged) throw updated;
    else return update;
  } catch (e) {
    throw new Error(e.response.data.message || e.response.data.messages);
  }
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
    getData,
  },
};
