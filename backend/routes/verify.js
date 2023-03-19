const { OAuth2Client } = require('google-auth-library');
const { GOOGLE_CLIENT_ID, ADMIN_USER_ID } = require('../config');

module.exports = {
  req: async (req) => {
    try {
      let { token } = req.body;

      if (!token) {
        const { authorization } = req.headers;
        token = authorization && authorization.split(' ')[1];
      }

      if (!token) throw new Error('Unable to find token');

      const client = new OAuth2Client(GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const userId = payload.sub;
      const isVerified = userId && userId.length > 0;

      return {
        isVerified,
        isAdmin: isVerified && userId === ADMIN_USER_ID,
      };
    } catch (e) {
      return e;
    }
  },
};
