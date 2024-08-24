const { ObjectId } = require('mongodb');
const mdb = require('../db/mdb');

let collection;

beforeAll(async () => {
  await mdb.connectToServer(() => {
    collection = mdb.getCollection('blacklist');
  });
});

afterAll(async () => {
  await mdb.closeConnection();
});

test('getBlacklist', async () => {
  const sample = (await collection.find({}).toArray())[0];

  expect(typeof sample._id === typeof new ObjectId()).toBeTruthy();
  expect(sample.id.length).toBeDefined();
  expect(sample.openCriticId).toBeDefined();
  expect(sample.name).toBeDefined();
});
