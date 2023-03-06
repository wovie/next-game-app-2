import axios from 'axios';

const url = 'api/users/';

class UserService {
  static async isAdmin(token) {
    const result = await axios.post(url, { token });
    return result.data;
  }
}

export default UserService;
