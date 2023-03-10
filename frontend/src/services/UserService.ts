import axios from 'axios';

const url = 'api/users/';

class UserService {
  static async isAdmin(token: string) {
    try {
      const result = await axios.post(url, { token });
      return result.data;
    } catch (e: any) {
      console.error(e.response.data);
      return false;
    }
  }
}

export default UserService;
