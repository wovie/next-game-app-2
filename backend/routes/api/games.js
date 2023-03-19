const express = require('express');
const { ObjectId } = require('mongodb');
const mdb = require('../../db/mdb');
const verify = require('../verify');

const router = express.Router();

async function updateGame(game) {
  const { _id, ...rest } = game;
  const games = mdb.getCollection('games');
  return games.updateOne(
    { _id: new ObjectId(_id) },
    { $set: rest },
  );
}

async function addGame(game) {
  const games = mdb.getCollection('games');
  const { _id, ...rest } = game;
  const query = { id: game.id };
  const replacement = rest;
  const options = { upsert: true };
  return games.replaceOne(query, replacement, options);
}

router.get('/', async (req, res) => {
  try {
    const games = mdb.getCollection('games');
    const result = await games.find({}).sort({ openCriticScore: -1 }).toArray();
    res.status(200).send(result);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    const result = await addGame(req.body);
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

    const games = mdb.getCollection('games');
    await games.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(204).send();
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.put('/update', async (req, res) => {
  try {
    const v = await verify.req(req);
    if (!v.isAdmin) throw new Error('Unauthorized');

    await updateGame(req.body);
    res.status(204).send();
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = {
  router,
  methods: {
    updateGame,
    addGame,
  },
};
