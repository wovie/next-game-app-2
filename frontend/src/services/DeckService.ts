import axios from 'axios';
import type Deck from '../props/Deck';

const url = 'api/decks/';

class DeckService {
  static async getDecks() {
    try {
      const result = await axios.get(url);
      return result.data;
    } catch (e: any) {
      console.error(e.response.data);
    }
  }

  static async addDeck(deck: Deck) {
    try {
      const result = await axios.post(url, deck);
      return result;
    } catch (e: any) {
      console.error(e.response.data);
    }
  }
}

export default DeckService;
