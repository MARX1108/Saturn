import {
  CombinedState,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import routes, { Route } from "./slice/routes";
import prefs, { Prefs } from "./slice/prefs";
import bottomSheet, { BottomSheet } from "./slice/bottomSheet";
import { reduxStorage } from "./storage.expoGo";
import post, { postState } from "./slice/post";
import searchPost from "./slice/post/search";
import toast, { ToastState } from "./slice/toast/toast";
import { authApi } from "./api/auth";

import user, { UserState } from "./slice/user";
import {
  persistReducer,
  REHYDRATE,
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  PersistConfig,
} from "redux-persist";
import chatList, { ChatList } from "./slice/chat/chatlist";
import { userApi } from "./api/user";
import { servicesApi } from "./api/services";
import { postsApi } from "./api/posts";
import { mediaApi } from "./api/media";
import loadingModal, { LoadingModal } from "./slice/modal/loading";
import searchPeople, { personState } from "./slice/people/search";
import followers, { FollowerState } from "./slice/user/followers";
import followedPost from "./slice/post/followed";
import { chatApi } from "./api/chat";
import online from "./slice/chat/online";
import currentPage from "./slice/currentPage";
import audio from "./slice/post/audio"
const persistConfig: PersistConfig<
  CombinedState<{
    routes: Route;
    prefs: Prefs;
    bottomSheet: BottomSheet;
    post: postState;
    searchPost: postState;
    toast: ToastState;
    user: UserState;
    online: { ids: Array<string> };
    followers: FollowerState;
    searchPeople: personState;
    loadingModal: LoadingModal;
    followedPost: postState;
    audio: any;
    chatlist: ChatList;
    currentPage: {
      page: string | null;
    };
    [chatApi.reducerPath]: any;
    [authApi.reducerPath]: any;
    [userApi.reducerPath]: any;
    [servicesApi.reducerPath]: any;
    [postsApi.reducerPath]: any;
    [mediaApi.reducerPath]: any;
  }>
> = {
  key: "root",
  storage: reduxStorage,
  whitelist: ["routes", "prefs", "user"],
};

const reducer = combineReducers({
  routes,
  prefs,
  bottomSheet,
  post,
  toast,

  loadingModal,
  searchPost,
  followers,
  chatlist: chatList,
  online,
  audio,
  [chatApi.reducerPath]: chatApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [servicesApi.reducerPath]: servicesApi.reducer,
  [postsApi.reducerPath]: postsApi.reducer,
  [mediaApi.reducerPath]: mediaApi.reducer,
  user,
  searchPeople,
  followedPost,
  currentPage,
});
const persistedReducer = persistReducer(persistConfig, reducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        immutableCheck: false,
        serializableCheck: false,
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(authApi.middleware)
      .concat(userApi.middleware)
      .concat(servicesApi.middleware)
      .concat(postsApi.middleware)
      .concat(mediaApi.middleware)
      .concat(chatApi.middleware),
});

// Export types after store creation to avoid circular dependencies
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
