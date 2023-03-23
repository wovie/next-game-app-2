const express = require('express');
const { ObjectId } = require('mongodb');
const mdb = require('../../db/mdb');
const verify = require('../verify');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const v = await verify.req(req);
    const { userId, isVerified } = v;
    if (!isVerified) throw new Error('Unauthorized');

    const decks = mdb.getCollection('decks');
    const result = await decks.find({ userId }).sort({ sort: 1 }).toArray();
    res.status(200).send(result);
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const v = await verify.req(req);
    const { userId, isVerified } = v;
    if (!isVerified) throw new Error('Unauthorized');

    const insert = {
      created: Date.now(),
      ...req.body,
      userId,
    };

    const decks = mdb.getCollection('decks');
    await decks.insertOne(insert);
    res.status(201).send();
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.post('/delete', async (req, res) => {
  try {
    const v = await verify.req(req);
    const { userId, isVerified } = v;
    const { _id, ...rest } = req.body;

    if (!isVerified || rest.userId !== userId) throw new Error('Unauthorized');

    const decks = mdb.getCollection('decks');
    await decks.deleteOne({ _id: new ObjectId(_id) });
    res.status(204).send();
  } catch (e) {
    res.status(500).json(e.message);
  }
});

router.put('/update', async (req, res) => {
  try {
    const v = await verify.req(req);
    const { userId, isVerified } = v;
    const { _id, ...rest } = req.body;

    if (!isVerified || rest.userId !== userId) throw new Error('Unauthorized');

    const decks = mdb.getCollection('decks');
    await decks.updateOne(
      { _id: new ObjectId(_id) },
      { $set: rest },
    );

    res.status(204).send();
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
