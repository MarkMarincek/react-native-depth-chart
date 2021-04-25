import {createStore} from 'redux';
import {ORDER_BOOKS_BUFFER} from 'src/config';
import {AppActions, AppActionTypes, AppState} from 'src/models/appStoreInterfaces';
import {OrderPairs} from 'src/models/enums';
import {OrderBook} from 'src/models/interfaces';

export const initialState: AppState = {
  orderBooks: {
    btceur: [],
  },
  activePair: OrderPairs.btcEur,
  activeIndex: 0,
};

function storeReducer(state = initialState, action: AppActions): AppState {
  switch (action.type) {
    case AppActionTypes.AddOrderBookEntry:
      const orderBooks = {...state.orderBooks};
      const newArray = state.orderBooks[state.activePair]
        ? [...(state.orderBooks[state.activePair] as OrderBook[])]
        : [];
      if (newArray.length >= ORDER_BOOKS_BUFFER) {
        newArray[ORDER_BOOKS_BUFFER - 1] = action.payload.orderBook;
      } else {
        newArray.push(action.payload.orderBook);
      }
      orderBooks[state.activePair] = newArray;
      return {...state, orderBooks, activeIndex: newArray.length - 1};
    default:
      return state;
  }
}

export default createStore(storeReducer);
