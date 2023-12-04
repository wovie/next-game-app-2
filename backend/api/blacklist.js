const express = require('express');
const { ObjectId } = require('mongodb');
const mdb = require('../db/mdb');
const verify = require('./verify');

const router = express.Router();

async function getBlacklist() {
  const blacklist = mdb.getCollection('blacklist');
  return blacklist.find({}).toArray();
}

async function blacklistGame(game) {
  const { _id, openCriticId, name } = game;
  const query = { openCriticId };
  const options = { upsert: true };
  const replace = {
    id: _id,
    openCriticId,
    name,
  };

  const blacklist = mdb.getCollection('blacklist');
  return blacklist.replaceOne(query, replace, options);
}

router.get('/', async (req, res) => {
  try {
    const result = await getBlacklist();
    res.status(200).send(result);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    const result = await blacklistGame(req.body);
    const { upsertedId } = result;
    res.status(201).send({ _id: upsertedId });
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    const blacklist = mdb.getCollection('blacklist');
    await blacklist.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(204).send();
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = {
  router,
  methods: {
    getBlacklist,
  },
};
