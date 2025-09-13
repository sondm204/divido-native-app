import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { USER_SERVICE_URL } from "../../commons/constants";

export interface User {
    id: string;
    name: string;
    email: string;
}

export const usersInitialState: User = {
    id: "",
    name: "",
    email: ""
};

export const userSlice = createSlice({
    name: "users",
    initialState: usersInitialState,
    reducers: {
        setCurrentUser: (state, action: PayloadAction<User>) => {
            state.id = action.payload.id;
            state.name = action.payload.name;
            state.email = action.payload.email;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.id = action.payload.id;
                state.name = action.payload.name;
                state.email = action.payload.email;
            })
    }
});

export const fetchCurrentUser = createAsyncThunk(
    "userEditor/fetchCurrentUser",
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`${USER_SERVICE_URL}/${userId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue("Failed to fetch user");
        }
    }
);

export const getUserByEmail = async (params: { email: string }) => {
    const endpoint = `${USER_SERVICE_URL}/email/${params.email}`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    return data;
}


export const { setCurrentUser } = userSlice.actions;

export default userSlice.reducer;
