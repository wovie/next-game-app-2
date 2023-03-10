const { MongoClient, ServerApiVersion } = require('mongodb');
const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_CLUSTER_URL } = require('../config');

const username = encodeURIComponent(MONGODB_USERNAME);
const password = encodeURIComponent(MONGODB_PASSWORD);
const clusterUrl = MONGODB_CLUSTER_URL;
const uri = `mongodb+srv://${username}:${password}@${clusterUrl}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

let dbConnection;

module.exports = {
  connectToServer: async (callback) => {
    try {
      await client.connect();
      console.log('Successfully connected to MongoDB.');
      dbConnection = client.db('main');
      return callback();
    } catch (e) {
      return callback(e);
    }
  },

  getCollection: (collection) => dbConnection.collection(collection),
};
