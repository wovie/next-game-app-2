const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const { GOOGLE_CLIENT_ID, ADMIN_USER_ID } = require('../../config');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: req.body.token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userId = payload['sub'];
    const isAdmin = userId === ADMIN_USER_ID;
    res.status(200).send(isAdmin);
  } catch(e) {
    res.status(500).json(e.message);
  }
});

module.exports = router;
