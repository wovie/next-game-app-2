const express = require('express');
const verify = require('./verify');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const v = await verify.req(req);
    res.status(200).send(v.isAdmin);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
