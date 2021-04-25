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
  SetActivePair = 'SET_ACTIVE_PAIR',
}

type AddOrderBookEntryAction = Action<AppActionTypes.AddOrderBookEntry, {orderBook: OrderBook; pair: OrderPairs}>;
type SetActiveIndexAction = Action<AppActionTypes.SetActiveIndex, {index: number}>;
type SetActivePairAction = Action<AppActionTypes.SetActivePair, {pair: OrderPairs}>;

export type AppActions = AddOrderBookEntryAction | SetActiveIndexAction | SetActivePairAction;
