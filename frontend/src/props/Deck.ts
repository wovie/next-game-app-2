export default interface Deck {
  _id: string;
  created?: number;
  gameIds: string[];
  name: string;
  selected?: boolean;
  userId?: string;
  sort?: number;
  filters?: any;
}
