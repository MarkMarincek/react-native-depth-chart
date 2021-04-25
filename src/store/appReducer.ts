import {createStore} from 'redux';
import {ORDER_BOOKS_BUFFER} from 'src/config';
import {AppActions, AppActionTypes, AppState} from 'src/models/appStoreInterfaces';
import {OrderPairs} from 'src/models/enums';
import {TransformedOrderBook} from 'src/models/interfaces';
import {transformOrderBook} from 'src/utils/helpers';

export const initialState: AppState = {
  orderBooks: {},
  activePair: OrderPairs.btcEur,
  activeIndex: 1,
};

function storeReducer(state = initialState, action: AppActions): AppState {
  switch (action.type) {
    case AppActionTypes.AddOrderBookEntry:
      const activeOrderBook = state.orderBooks[action.payload.pair];
      if (activeOrderBook?.length && activeOrderBook.length - 1 !== state.activeIndex) {
        return state;
      }
      const entry = transformOrderBook(action.payload.orderBook);
      if (!entry) {
        return state;
      }

      let newArray: TransformedOrderBook[];

      if (!activeOrderBook) {
        newArray = [entry];
      } else if (activeOrderBook.length < ORDER_BOOKS_BUFFER) {
        newArray = [...activeOrderBook, entry];
      } else {
        newArray = [...activeOrderBook.slice(1, activeOrderBook.length), entry];
      }

      const orderBooks = {...state.orderBooks};
      orderBooks[state.activePair] = newArray;
      return {...state, orderBooks, activeIndex: newArray.length - 1};

    case AppActionTypes.SetActiveIndex:
      return {...state, activeIndex: action.payload.index};
    case AppActionTypes.SetActivePair:
      return {
        ...state,
        activePair: action.payload.pair,
        activeIndex: Math.max(0, (state.orderBooks[action.payload.pair] ?? []).length - 1),
      };
    default:
      return state;
  }
}

export default createStore(storeReducer);
