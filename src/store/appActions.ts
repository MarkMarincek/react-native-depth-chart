import {AppActions, AppActionTypes} from 'src/models/appStoreInterfaces';
import {OrderPairs} from 'src/models/enums';
import {OrderBook} from 'src/models/interfaces';

export function addOrderBookEntryAction(pair: OrderPairs, orderBook: OrderBook): AppActions {
  return {
    type: AppActionTypes.AddOrderBookEntry,
    payload: {orderBook, pair},
  };
}

export function setActiveIndexAction(index: number): AppActions {
  return {
    type: AppActionTypes.SetActiveIndex,
    payload: {
      index,
    },
  };
}

export function setActivePairAction(pair: OrderPairs): AppActions {
  return {
    type: AppActionTypes.SetActivePair,
    payload: {pair},
  };
}
