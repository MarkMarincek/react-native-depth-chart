import React, {useCallback, useEffect, useMemo} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {throttle} from 'throttle-debounce';
import {VictoryArea, VictoryAxis, VictoryChart, VictoryGroup, VictoryTheme} from 'victory-native';
import {OrderBook, OrderBookResponse} from 'src/models/interfaces';
import {useDispatch, useSelector} from 'react-redux';
import {AppState} from './models/appStoreInterfaces';
import {AddOrderBookEntryAction} from './store/appActions';

function stateSelector(state: AppState) {
  const {orderBooks, activePair, activeIndex} = state;
  const currentPairOrderBook = orderBooks[activePair];
  return {orderBook: currentPairOrderBook ? currentPairOrderBook[activeIndex] : undefined, activePair, activeIndex};
}

const DepthChart = () => {
  const {orderBook, activePair, activeIndex} = useSelector(stateSelector);
  const dispatch = useDispatch();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttleSetState = useCallback(
    throttle(1000, false, (data: OrderBook) => dispatch(AddOrderBookEntryAction(data))),
    [],
  );

  const chartData = useMemo(() => {
    if (!orderBook?.asks || !orderBook?.bids) {
      return {bids: [], asks: []};
    }

    let askTotal = 0;
    const asks = orderBook.asks.map(ask => {
      askTotal += Number(ask[1]);
      return {
        x: Number(ask[0]),
        y: askTotal,
        color: 'red',
      };
    });
    let bidTotal = 0;
    const bids = orderBook.bids.map(bid => {
      bidTotal += Number(bid[1]);
      return {
        x: Number(bid[0]),
        y: bidTotal,
        color: 'green',
      };
    });

    return {bids, asks};
  }, [orderBook]);

  useEffect(() => {
    const socket = new WebSocket('wss://ws.bitstamp.net');
    socket.onopen = () => {
      const json = JSON.stringify({
        event: 'bts:subscribe',
        data: {
          channel: 'order_book_btcusd',
        },
      });
      socket.send(json);
      socket.onmessage = event => {
        throttleSetState((JSON.parse(event.data) as OrderBookResponse).data);
      };
    };

    return () => {
      socket.close();
    };
  }, [throttleSetState]);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <VictoryChart theme={VictoryTheme.material} domainPadding={0}>
          <VictoryAxis style={{grid: {stroke: 'transparent'}}} />
          <VictoryAxis dependentAxis style={{grid: {stroke: 'transparent'}}} />
          <VictoryGroup offset={0}>
            <VictoryArea
              data={chartData.bids}
              style={{
                data: {
                  fill: 'green',
                },
              }}
            />
            <VictoryArea
              data={chartData.asks}
              style={{
                data: {
                  fill: 'red',
                },
              }}
            />
          </VictoryGroup>
        </VictoryChart>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5fcff',
  },
});

export default DepthChart;
