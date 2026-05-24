import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import postSlice from './postSlice'
import socketSlice from "./socketSlice"
import chatSlice from "./chatSlice"
import rtmSlice from "./rtmSlice"

import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import createWebStorage from "redux-persist/es/storage/createWebStorage";

const storage = createWebStorage("local");

const persistConfig = {
  key: "root",
  version: 1,
  storage,
  blacklist: ['socketio'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  post:postSlice,
  socketio:socketSlice,
  chat:chatSlice,
  realTimeNotification:rtmSlice,
});

const persistedReducer = persistReducer(
  persistConfig,
  rootReducer
);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          'socketio/setSocket'
        ],
        ignoredPaths: ['socketio.socket'],
      },
    }),
});

export default store;