const express = require('express');
const mdb = require('../../db/mdb');
const { ObjectId } = require('mongodb');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const games = mdb.getCollection('games');
    const result = await games.find({}).sort({ openCriticScore: -1 }).toArray();
    res.status(200).send(result);
  } catch(e) {
    res.status(500).json(e.message);
  }
});

router.post('/', async(req, res) => {
  try {
    const games = mdb.getCollection('games');
    const { _id, ...rest  } = req.body;
    const query = { id: req.body.id };
    const replacement = rest;
    const options = { upsert: true };
    const result = await games.replaceOne(query, replacement, options);
    const { upsertedId } = result;
    res.status(201).send({ _id: upsertedId });
  } catch(e) {
    res.status(500).json(e.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const games = mdb.getCollection('games');
    await games.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(204).send();
  } catch(e) {
    res.status(500).json(e.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const games = mdb.getCollection('games');
    const { _id, ...rest } = req.body;
    await games.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: rest },
    );
    res.status(204).send();
  } catch(e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
