import type Platform from './Platform';

export default interface Game {
  _id: string;
  howLongToBeatId?: number;
  howLongToBeatTime?: {
    main?: number;
    mainPlus?: number;
    complete?: number;
  };
  howLongToBeatTimeUpdated?: number;
  id?: number;
  name?: string;
  openCriticId?: number;
  openCriticScore?: number;
  openCriticScoreUpdated?: number;
  openCriticUrl?: string;
  platforms?: Platform[];
  released?: number;
  timestamp?: number;
}
