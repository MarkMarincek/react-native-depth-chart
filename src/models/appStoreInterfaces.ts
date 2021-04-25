import {OrderPairs} from './enums';
import {Action, OrderBook, TransformedOrderBook} from './interfaces';

export interface AppState {
  orderBooks: Partial<Record<OrderPairs, TransformedOrderBook[]>>;
  activePair: OrderPairs;
  activeIndex: number;
}

export enum AppActionTypes {
  AddOrderBookEntry = 'ADD_ORDER_BOOK_ENTRY',
  SetActiveIndex = 'SET_ACTIVE_INDEX',
}

type AddOrderBookEntryAction = Action<AppActionTypes.AddOrderBookEntry, {orderBook: OrderBook}>;
type SetActiveIndexAction = Action<AppActionTypes.SetActiveIndex, {index: number}>;

export type AppActions = AddOrderBookEntryAction | SetActiveIndexAction;
