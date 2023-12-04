const { MongoClient, ObjectId } = require('mongodb');

describe('games', () => {
  let connection;
  let mdb;
  let games;

  const mockGame = {
    _id: new ObjectId('642b3d063c968856045da4cc'),
    name: 'Super Mario Odyssey',
    openCriticId: 4504,
    openCriticScore: 97,
    openCriticScoreUpdated: 1680555271395,
    openCriticUrl: 'https://opencritic.com/game/4504/super-mario-odyssey',
    platforms: [{
      name: 'Nintendo Switch',
      shortName: 'Switch',
      id: 32,
    }],
    released: 1509062400000,
    howLongToBeatId: 42833,
    howLongToBeatTime: {
      main: 13,
      mainPlus: 28,
      complete: 63,
    },
    howLongToBeatTimeUpdated: 1680622929360,
  };

  beforeAll(async () => {
    connection = await MongoClient.connect(globalThis.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    mdb = await connection.db(globalThis.__MONGO_DB_NAME__);
    games = mdb.collection('games');
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should insert a game', async () => {
    const query = { _id: mockGame._id };
    const options = { upsert: true };
    const result = await games.replaceOne(query, mockGame, options);
    expect(result.upsertedCount).toBe(1);
  });

  it('should fetch the game', async () => {
    const result = await games.find().toArray();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockGame);
  });

  it('should update the game', async () => {
    const result = await games.updateOne(
      { _id: new ObjectId(mockGame._id) },
      { $set: { openCriticId: 98 } },
    );
    expect(result.modifiedCount).toBe(1);
  });

  it('should delete the game', async () => {
    const result = await games.deleteOne({ _id: new ObjectId(mockGame._id) });
    expect(result.deletedCount).toBe(1);
  });

  it('should fetch no games', async () => {
    const result = await games.find().toArray();
    expect(result).toHaveLength(0);
  });
});
