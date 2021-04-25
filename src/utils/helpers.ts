import {OrderBook} from 'src/models/interfaces';

function transformOrderBook(orderBook: OrderBook) {
  if (!orderBook.asks || !orderBook.bids) {
    return null;
  }
  let askTotal = 0;
  const asks = orderBook.asks.map(ask => {
    askTotal += Number(ask[1]);
    return {
      x: Number(ask[0]),
      y: askTotal,
    };
  });
  let bidTotal = 0;
  const bids = orderBook.bids.map(bid => {
    bidTotal += Number(bid[1]);
    return {
      x: Number(bid[0]),
      y: bidTotal,
    };
  });
  return {...orderBook, asks, bids};
}

export {transformOrderBook};
