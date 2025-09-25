import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AUTH_SERVER_URL } from "../../commons/constants";
import { storeToken } from "@/src/utils/utils";

// Kiểu dữ liệu user
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {  
  id: string;
  name: string;
  email: string;
  token: string;
}

// Kiểu dữ liệu auth state
export interface AuthState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

// Trạng thái khởi tạo
const initialState: AuthState = {
  currentUser: null,
  loading: false,
  error: null,
};

// Async thunk: login
export const login = createAsyncThunk(
  "login",
  async (
    params: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();
      return data.data as LoginResponse;
    } catch (error) {
      return rejectWithValue("Failed to login:" + error);
    }
  }
);

export const emailVerification = createAsyncThunk(
  "emailVerification",
  async (params: { email: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/email-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error("Email verification failed");
      }
      return response.json();
    } catch (error) {
      return rejectWithValue("Failed to email verification:" + error);
    }
  }
);

export const verifyEmail = createAsyncThunk(
  "verifyEmail",
  async (params: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error("Verify email failed");
      }
      return response.json();
    } catch (error) {
      return rejectWithValue("Failed to verify code:" + error);
    }
  }
);

// Async thunk: register
export const register = createAsyncThunk(
  "register",
  async (
    params: { name: string; email: string; password: string; verificationToken: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Register failed");
      }

      const data = await response.json();
      return data.user; // chỉ lấy user
    } catch (error) {
      return rejectWithValue("Failed to register");
    }
  }
);

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    // LOGIN
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const user = {
          id: action.payload.id,
          name: action.payload.name,
          email: action.payload.email,
        };
        state.loading = false;
        state.currentUser = user;
        storeToken(action.payload.token);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // REGISTER
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
