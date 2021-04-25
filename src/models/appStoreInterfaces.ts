import {OrderPairs} from './enums';
import {Action, OrderBook} from './interfaces';

export interface AppState {
  orderBooks: Partial<Record<OrderPairs, OrderBook[]>>;
  activePair: OrderPairs;
  activeIndex: number;
}

export enum AppActionTypes {
  AddOrderBookEntry = 'ADD_ORDER_BOOK_ENTRY',
}

export type AddOrderBookEntryAction = Action<AppActionTypes.AddOrderBookEntry, {orderBook: OrderBook}>;

export type AppActions = AddOrderBookEntryAction;
