import {AppActions, AppActionTypes} from 'src/models/appStoreInterfaces';
import {OrderBook} from 'src/models/interfaces';

export function AddOrderBookEntryAction(orderBook: OrderBook): AppActions {
  return {
    type: AppActionTypes.AddOrderBookEntry,
    payload: {orderBook},
  };
}
