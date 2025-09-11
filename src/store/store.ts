import { configureStore } from "@reduxjs/toolkit";
import groupsReducer from "./slices/groupsSlice";
import usersReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    groups: groupsReducer,
    users: usersReducer,
  },
});

// types cho TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
