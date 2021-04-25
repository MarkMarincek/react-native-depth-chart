import React from 'react';
import {Provider} from 'react-redux';
import DepthChart from './DepthChart';
import store from 'src/store';

export default function App() {
  return (
    <Provider store={store}>
      <DepthChart />
    </Provider>
  );
}
