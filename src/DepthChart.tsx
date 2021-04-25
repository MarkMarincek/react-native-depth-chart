import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {throttle} from 'throttle-debounce';
import {VictoryArea, VictoryAxis, VictoryChart, VictoryGroup, VictoryTheme} from 'victory-native';
import {OrderBook, OrderBookResponse} from 'src/models/interfaces';
import {useDispatch, useSelector} from 'react-redux';
import {AppState} from './models/appStoreInterfaces';
import {addOrderBookEntryAction, setActiveIndexAction} from './store/appActions';
import {format} from 'date-fns';
import Slider from '@react-native-community/slider';

function stateSelector(state: AppState) {
  const {orderBooks, activePair, activeIndex} = state;
  const orderBook = orderBooks[activePair];
  return {
    orderBook,
    activeOrderBook: orderBook ? orderBook[activeIndex] : undefined,
    activePair,
    activeIndex,
  };
}

const DepthChart = () => {
  const {orderBook, activeOrderBook, activePair, activeIndex} = useSelector(stateSelector);
  const dispatch = useDispatch();

  const [socket, setSocket] = useState<WebSocket>();
  const isLive = orderBook?.length ? orderBook.length - 1 === activeIndex : true;

  const timestamp = useMemo(() => {
    if (!activeOrderBook?.timestamp) {
      return '';
    }

    return format(new Date(Number(activeOrderBook.timestamp) * 1000), 'HH:mm:ss');
  }, [activeOrderBook]);

  const timelineLength = useMemo(() => {
    if (!orderBook?.length) {
      return 0;
    }

    return Number(orderBook[orderBook.length - 1].timestamp) - Number(orderBook[0].timestamp);
  }, [orderBook]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttleSetState = useCallback(
    throttle(1000, false, (data: OrderBook) => {
      isLive && dispatch(addOrderBookEntryAction(data));
    }),
    [isLive],
  );

  const onSliderValueChange = useCallback(
    index => {
      dispatch(setActiveIndexAction(index - 1));
    },
    [dispatch],
  );

  useEffect(() => {
    const newSocket = new WebSocket('wss://ws.bitstamp.net');
    newSocket.onopen = () => {
      setSocket(newSocket);
    };
    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (!socket || !activePair) {
      return;
    }

    const subscribeJson = JSON.stringify({
      event: 'bts:subscribe',
      data: {
        channel: `order_book_${activePair}`,
      },
    });
    const unsubscribeJson = JSON.stringify({
      event: 'bts:unsubscribe',
      data: {
        channel: `order_book_${activePair}`,
      },
    });

    socket.send(subscribeJson);
    return () => {
      socket.send(unsubscribeJson);
    };
  }, [socket, activePair]);

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = event => {
      throttleSetState((JSON.parse(event.data) as OrderBookResponse).data);
    };
  }, [throttleSetState, socket]);

  function goLive() {
    if (!orderBook) {
      return;
    }
    dispatch(setActiveIndexAction(orderBook.length - 1));
  }

  if (!activeOrderBook || !orderBook) {
    return (
      <View style={styles.loadingWrapper}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeView}>
      <View style={styles.container}>
        <VictoryChart theme={VictoryTheme.material} domainPadding={0} padding={34}>
          <VictoryAxis style={{grid: {stroke: 'transparent'}}} />
          <VictoryAxis dependentAxis style={{grid: {stroke: 'transparent'}}} />
          <VictoryGroup offset={0}>
            <VictoryArea
              data={activeOrderBook.bids}
              style={{
                data: {
                  fill: 'green',
                },
              }}
            />
            <VictoryArea
              data={activeOrderBook.asks}
              style={{
                data: {
                  fill: 'red',
                },
              }}
            />
          </VictoryGroup>
        </VictoryChart>
        <Text style={styles.timestampText}>Timestamp:</Text>
        <Text style={styles.timestampText}>{timestamp}</Text>
        <View style={styles.liveWrapper}>
          <Text>-{timelineLength}s</Text>
          <TouchableOpacity onPress={goLive}>
            <Text style={[styles.liveText, {color: isLive ? 'green' : 'red'}]}>Live</Text>
          </TouchableOpacity>
        </View>
        <Slider
          style={styles.slider}
          value={activeIndex + 1}
          minimumValue={orderBook.length === 1 ? 0 : 1}
          maximumValue={orderBook.length}
          onValueChange={onSliderValueChange}
          step={1}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'black',
  },
  safeView: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 34,
  },
  timestampText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  slider: {
    width: '100%',
  },
  liveWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 24,
  },
  liveText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default DepthChart;
