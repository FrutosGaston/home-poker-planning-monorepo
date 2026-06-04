export interface Card {
  id: number;
  value: string;
  deckId: number;
}

export interface Deck {
  id: number;
  name: string;
  cards: Card[];
}

export interface Estimation {
  id: number;
  card: Card;
  cardId: number;
  taskId: number;
  guestUserId: number;
  active: boolean;
}

export interface Task {
  id: number;
  roomId: number;
  title: string;
  estimationId?: number;
  estimation?: Estimation;
  estimations: Estimation[];
}

export interface Room {
  id: number;
  uuid: string;
  deckId: number;
  deck: Deck;
  selectedTaskId?: number;
  title: string;
  description?: string;
}

export interface GuestUser {
  id: number;
  name: string;
  roomId: number;
  spectator: boolean;
}
