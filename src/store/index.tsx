
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import { createMigrate, persistReducer, persistStore } from 'redux-persist';
import thunk from 'redux-thunk';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authSlice from './slice/authSlice';
import ticketSlice from './slice/ticketSlice';
import ticketListSlice from './slice/ticketListSlice';
import ticketDetailSlice from './slice/ticketDetailSlice';


const migrations = {
  0: (state: any) => {
    return {
      ...state,
    };
  },
};

const persistConfig = {
  key: 'root',
  version: 0,
  migrate: createMigrate(migrations, { debug: false }),
  storage: AsyncStorage,
};

const appReducer = combineReducers({
  auth: authSlice,
  ticket:ticketSlice,
  ticketList:ticketListSlice,
  ticketDetail:ticketDetailSlice,


});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'LOGOUT') {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: true,
      serializableCheck: false,
    }),

});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

