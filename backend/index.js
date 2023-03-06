const express = require('express');
const mdb = require('./db/mdb');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(express.json());
console.log('TODO: explore express.urlencoded');

console.log('TODO: explore cors');
// app.use(cors());

// Routing
app.use('/api/games', require('./routes/api/games'));
app.use('/api/hltb', require('./routes/api/hltb'));
app.use('/api/oc', require('./routes/api/oc'));
app.use('/api/rawg', require('./routes/api/rawg'));
app.use('/api/users', require('./routes/api/users'));

console.log('TODO: handle production');
// Handle production
// if (process.env.NODE_ENV === 'production') {
//   // Static folder
//   app.use(express.static(__dirname + '/public'));

//   // Handle SPA
//   app.get(/.*/, (req, res) => res.sendFile(__dirname + '/public/index.htmnl'));
// }

console.log('TODO: explore express global error handling');
// Global error handling
// app.use(function (err, _req, res) {
//   console.error(err.stack);
//   res.status(500).send('Something broke!');
// });

mdb.connectToServer(err => {
  if (err) {
    console.error(err);
    process.exit();
  }

  app.listen(port, () => console.log(`Server started on port: ${port}`))
});

