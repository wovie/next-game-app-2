const express = require('express');
const axios = require("axios");
const { RAWG_KEY } = require('../../config');

const router = express.Router();
const url = 'https://api.rawg.io/api/games';

router.post('/', async (req, res) => {
  try {
    const result = await axios.get(url, {
      params: {
        key: RAWG_KEY,
        ...req.body,
      },
    });

    res.status(200).send(result.data.results);
  } catch(e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
