/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect } from 'react';
import {
  useColorScheme,
} from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import Navigation from './src/navigation/Navigation';
import { offlineTicketSync } from './src/services/offlineTicketSync';

const App = () => {
  const color = useColorScheme();
  useEffect(() => {
    offlineTicketSync.start();
    return () => {
      offlineTicketSync.stop();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Navigation />
        <Toast />
      </PersistGate>
    </Provider>
  );
};

export default App;
