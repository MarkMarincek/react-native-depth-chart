import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {throttle} from 'throttle-debounce';
import {VictoryArea, VictoryAxis, VictoryChart, VictoryGroup, VictoryTheme} from 'victory-native';
import {OrderBookResponse} from 'src/models/interfaces';
import {useDispatch, useSelector} from 'react-redux';
import {AppState} from './models/appStoreInterfaces';
import {addOrderBookEntryAction, setActiveIndexAction, setActivePairAction} from './store/appActions';
import {format} from 'date-fns';
import Slider from '@react-native-community/slider';
import {Picker} from '@react-native-picker/picker';
import {OrderPairs} from './models/enums';
import {API_URL} from './config';

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

  // Warning because of the throttle function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttleSetState = useCallback(
    throttle(1000, true, (data: OrderBookResponse) => {
      const dataPair = data.channel.split('_')[2] as OrderPairs;

      isLive && dispatch(addOrderBookEntryAction(dataPair, data.data));
    }),
    [isLive],
  );

  // Warning because of the throttle function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSliderValueChange = useCallback(
    throttle(250, false, (index: number) => {
      dispatch(setActiveIndexAction(index - 1));
    }),
    [dispatch],
  );

  useEffect(() => {
    const newSocket = new WebSocket(API_URL);
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
      const response = JSON.parse(event.data) as OrderBookResponse;
      throttleSetState(response);
    };
  }, [throttleSetState, socket]);

  function goLive() {
    if (!orderBook) {
      return;
    }
    dispatch(setActiveIndexAction(orderBook.length - 1));
  }

  function selectOrderPair(pair: OrderPairs) {
    dispatch(setActivePairAction(pair));
  }

  if (!activeOrderBook || !orderBook) {
    return (
      <View style={styles.loadingWrapper}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const liveTextColor = isLive ? 'green' : 'red';

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
            <Text style={[styles.liveText, {color: liveTextColor}]}>Live</Text>
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
      <Picker selectedValue={activePair} onValueChange={selectOrderPair}>
        {Object.values(OrderPairs).map(pair => {
          const label = pair.slice(0, 3) + '-' + pair.slice(3, 6);
          return <Picker.Item key={pair} label={label.toUpperCase()} value={pair} />;
        })}
      </Picker>
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
