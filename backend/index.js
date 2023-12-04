const express = require('express');
const mdb = require('./db/mdb');
// const cors = require('cors');
const jobs = require('./jobs/jobs');
const oc = require('./api/oc');
const games = require('./api/games');
const hltb = require('./api/hltb');
const blacklist = require('./api/blacklist');
const itad = require('./api/itad');

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
console.log('TODO: explore express.urlencoded');

console.log('TODO: explore cors');
// app.use(cors());

// Routing
app.use('/api/games', games.router);
app.use('/api/hltb', hltb.router);
app.use('/api/oc', oc.router);
app.use('/api/users', require('./api/users'));
app.use('/api/jobs', require('./api/jobs'));
app.use('/api/decks', require('./api/decks'));

app.use('/api/blacklist', blacklist.router);
app.use('/api/itad', itad.router);

console.log('TODO: explore express global error handling');
// Global error handling
// app.use(function (err, _req, res) {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

mdb.connectToServer((err) => {
  if (err) {
    console.error(err);
    process.exit();
  }

  app.listen(port, () => {
    console.log(`Server started on port: ${port}`);

    if (process.env.NODE_ENV && process.env.NODE_ENV.trim() === 'development') {
      jobs.run();
    }
  });
});
