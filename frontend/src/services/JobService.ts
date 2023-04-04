import axios from 'axios';

const url = 'api/jobs/';

class JobService {
  static async status() {
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (e: any) {
      console.error(e.response.data);
    }
  }

  static async run(id: string) {
    try {
      const result = await axios.post(url, { id });
      return result.data;
    } catch (e: any) {
      console.error(e.response.data);
    }
  }
}

export default JobService;
