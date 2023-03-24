const express = require('express');
const { ObjectId } = require('mongodb');
const _ = require('lodash');
const mdb = require('../../db/mdb');
const verify = require('../verify');

const router = express.Router();

function getDecks(userId) {
  const decks = mdb.getCollection('decks');
  return decks.find({ userId }).sort({ sort: 1 }).toArray();
}

function updateDeck(deck) {
  const { _id, ...rest } = deck;
  const decks = mdb.getCollection('decks');
  return decks.updateOne(
    { _id: new ObjectId(_id) },
    { $set: rest },
  );
}

router.get('/', async (req, res) => {
  try {
    const v = await verify.req(req);
    const { userId, isVerified } = v;
    if (!isVerified) throw new Error('Unauthorized');

    const result = await getDecks(userId);
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

    const { _id, ...rest } = req.body;
    const result = await getDecks(userId);
    const max = _.max(_.map(result, 'sort'));

    const insert = {
      created: Date.now(),
      ...rest,
      userId,
      sort: max === undefined ? 1 : max + 1,
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

    const result = await getDecks(userId);
    const { sort } = rest;

    const adjust = _.filter(result, (d) => d.sort > sort);

    adjust.forEach((d) => { d.sort -= 1; });

    const decks = mdb.getCollection('decks');
    await decks.deleteOne({ _id: new ObjectId(_id) });
    for await (const a of adjust) {
      await updateDeck(a);
    }

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

    await updateDeck(req.body);
    res.status(204).send();
  } catch (e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
