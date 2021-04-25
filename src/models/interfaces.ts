export interface TimestampObject {
  timestamp: number;
  microtimestamp: number;
}

export interface OrderBook extends TimestampObject {
  bids: [[number, number]];
  asks: [[number, number]];
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
