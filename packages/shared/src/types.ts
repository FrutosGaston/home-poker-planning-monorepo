export interface Card {
  id: string;
  value: string;
}

export interface Deck {
  id: string;
  name: string;
  cards: Card[];
}

export interface Estimation {
  id: string;
  card: Card;
  guestUserId: string;
  active: boolean;
}

export interface Task {
  id: string;
  roomId: string;
  title: string;
  finalEstimation: Card | null;
  estimations: Estimation[];
}

export interface Room {
  id: string;
  uuid: string;
  deckId: string;
  deck: Deck;
  selectedTaskId?: string;
  title: string;
  description?: string;
}

export interface GuestUser {
  id: string;
  name: string;
  roomId: string;
  spectator: boolean;
}
