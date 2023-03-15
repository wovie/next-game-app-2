import axios from 'axios';

const url = 'api/rawg/';

class RAWGService {
  static async search(params: any) {
    try {
      const result = await axios.post(url, params);
      return result.data;
    } catch (e: any) {
      console.error(e.response.data);
    }
  }
}

export default RAWGService;
