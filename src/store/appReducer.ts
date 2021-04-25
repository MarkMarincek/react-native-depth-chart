import {createStore} from 'redux';
import {ORDER_BOOKS_BUFFER} from 'src/config';
import {AppActions, AppActionTypes, AppState} from 'src/models/appStoreInterfaces';
import {OrderPairs} from 'src/models/enums';
import {TransformedOrderBook} from 'src/models/interfaces';

export const initialState: AppState = {
  orderBooks: {
    btceur: [],
  },
  activePair: OrderPairs.btcEur,
  activeIndex: 1,
};

function storeReducer(state = initialState, action: AppActions): AppState {
  switch (action.type) {
    case AppActionTypes.AddOrderBookEntry:
      if (!action.payload?.orderBook?.asks || !action.payload?.orderBook?.bids) {
        return state;
      }
      const activeOrderBook = state.orderBooks[state.activePair];
      if (activeOrderBook?.length && activeOrderBook.length - 1 !== state.activeIndex) {
        return state;
      }

      console.log('adding entry!');

      const orderBooks = {...state.orderBooks};

      let askTotal = 0;
      const asks = action.payload.orderBook.asks.map(ask => {
        askTotal += Number(ask[1]);
        return {
          x: Number(ask[0]),
          y: askTotal,
        };
      });
      let bidTotal = 0;
      const bids = action.payload.orderBook.bids.map(bid => {
        bidTotal += Number(bid[1]);
        return {
          x: Number(bid[0]),
          y: bidTotal,
        };
      });
      const entry = {...action.payload.orderBook, asks, bids};

      let newArray: TransformedOrderBook[];

      if (!activeOrderBook) {
        newArray = [entry];
      } else if (activeOrderBook.length < ORDER_BOOKS_BUFFER) {
        newArray = [...activeOrderBook, entry];
      } else {
        newArray = [...activeOrderBook.slice(1, activeOrderBook.length), entry];
      }
      orderBooks[state.activePair] = newArray;
      return {...state, orderBooks, activeIndex: newArray.length - 1};

    case AppActionTypes.SetActiveIndex:
      return {...state, activeIndex: action.payload.index};
    default:
      return state;
  }
}

export default createStore(storeReducer);
