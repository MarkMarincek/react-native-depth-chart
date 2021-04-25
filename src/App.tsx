import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import {throttle} from 'throttle-debounce';
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryGroup,
  VictoryTheme,
} from 'victory-native';
import {OrderBookResponse} from 'src/models/interfaces';

const App = () => {
  const [state, setState] = useState<OrderBookResponse | undefined>(undefined);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttleSetState = useCallback(throttle(1000, false, setState), []);

  const chartData = useMemo(() => {
    if (!state?.data.asks || !state?.data.bids) {
      return {bids: [], asks: [], domain: {x: [0, 1], y: [0, 1]}};
    }

    let askTotal = 0;
    const asks = state?.data.asks.map(ask => {
      askTotal += Number(ask[1]);
      return {
        x: Number(ask[0]),
        y: askTotal,
        color: 'red',
      };
    });
    let bidTotal = 0;
    const bids = state?.data.bids.map(bid => {
      bidTotal += Number(bid[1]);
      return {
        x: Number(bid[0]),
        y: bidTotal,
        color: 'green',
      };
    });

    return {bids, asks};
  }, [state]);

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
        throttleSetState(JSON.parse(event.data) as OrderBookResponse);
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

export default App;
