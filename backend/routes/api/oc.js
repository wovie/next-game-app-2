const express = require('express');
const axios = require("axios");
const { OPENCRITIC_KEY } = require('../../config');

const router = express.Router();
const url = 'https://opencritic-api.p.rapidapi.com/game/';
const headers = {
  'X-RapidAPI-Key': OPENCRITIC_KEY,
  'X-RapidAPI-Host': 'opencritic-api.p.rapidapi.com',
};

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await axios.get(`${url}${id}`, {
      headers,
    });
    res.status(200).send({
      openCriticId: id,
      openCriticScore: Math.round(result.data.topCriticScore),
      openCriticScoreUpdated: Date.now(),
      openCriticUrl: result.data.url,
    });
  } catch(e) {
    res.status(500).json(e.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const { criteria } = req.body;
    const result = await axios.get(`${url}search`, {
      params: {
        criteria,
      },
      headers,
    });
    res.status(201).send(result.data);
  } catch(e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
