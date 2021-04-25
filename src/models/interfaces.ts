export interface TimestampObject {
  timestamp: string;
  microtimestamp: string;
}

export interface OrderBook extends TimestampObject {
  bids?: [[number, number]];
  asks?: [[number, number]];
}

export interface TransformedOrderBook extends TimestampObject {
  bids: {x: number; y: number}[];
  asks: {x: number; y: number}[];
}

export interface BitstampMessage {
  event: string;
  data: {
    channel: string;
  };
}

export interface BitstampResponse<T> {
  channel: string;
  event: string;
  data: T;
}

export type OrderBookResponse = BitstampResponse<OrderBook>;

export interface Action<T, D> {
  type: T;
  payload: D;
}
