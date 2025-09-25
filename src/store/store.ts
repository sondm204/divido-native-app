import { configureStore } from "@reduxjs/toolkit";
import groupsReducer from "./slices/groupsSlice";
import usersReducer from "./slices/userSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    groups: groupsReducer,
    users: usersReducer,
    auth: authReducer,
  },
});

// types cho TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
