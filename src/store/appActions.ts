import {AppActions, AppActionTypes} from 'src/models/appStoreInterfaces';
import {OrderBook} from 'src/models/interfaces';

export function addOrderBookEntryAction(orderBook: OrderBook): AppActions {
  return {
    type: AppActionTypes.AddOrderBookEntry,
    payload: {orderBook},
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
