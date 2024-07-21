const express = require('express');
const axios = require('axios');
const validator = require('validator');
const verify = require('./verify');
const games = require('./games');
const { ISTHEREANYDEAL_KEY } = require('../config');

const router = express.Router();
const url = 'https://api.isthereanydeal.com/';
const key = ISTHEREANYDEAL_KEY;

async function getData(game) {
  try {
    const { name } = game;
    let { isThereAnyDealId } = game;

    const isUUID = isThereAnyDealId && validator.isUUID(isThereAnyDealId);

    if (!isUUID) {
      const result = await axios.get(`${url}games/lookup/v1`, {
        params: {
          key,
          title: name,
        },
      });

      const { data } = result;
      const { id } = data.game;
      if (!data.found) {
        throw new Error(`Unable to determine IsThereAnyDeal ID for: ${name}`);
      }

      isThereAnyDealId = id;
    }

    let result = await axios.post(
      'https://api.isthereanydeal.com/games/historylow/v1',
      [isThereAnyDealId],
      { params: { key } },
    );

    const { data } = result;
    const { cut, price } = data[0].low;

    result = await axios.get(`${url}games/info/v2`, {
      params: {
        key,
        id: isThereAnyDealId,
      },
    });

    const { urls } = result.data;

    const update = {
      ...game,
      isThereAnyDealId,
      isThereAnyDealPrice: {
        cut,
        price: price.amount,
      },
      isThereAnyDealPriceUpdated: Date.now(),
      isThereAnyDealUrl: urls.game,
    };

    const updated = await games.methods.updateGame(update);

    if (!updated.acknowledged) throw updated;
    else return update;
  } catch (e) {
    console.log(e);
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
