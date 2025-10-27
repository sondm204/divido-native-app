import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API_BASE_URL, USER_SERVICE_URL } from "../../commons/constants";
import { request } from "@/src/utils/callApi";

export interface User {
    id: string;
    name: string;
    email: string;
    totalBudget?: number;
    foodBudget?: number;
    entertainmentBudget?: number;
    reminded?: boolean;
}

export const usersInitialState: User = {
    id: "",
    name: "",
    email: "",
    totalBudget: 0,
    foodBudget: 0,
    entertainmentBudget: 0,
    reminded: false
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
                state.totalBudget = action.payload.totalBudget;
                state.foodBudget = action.payload.foodBudget;
                state.entertainmentBudget = action.payload.entertainmentBudget;
                state.reminded = action.payload.reminded;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                state.name = action.payload.name;
                state.email = action.payload.email;
                state.totalBudget = action.payload.totalBudget;
                state.foodBudget = action.payload.foodBudget;
                state.entertainmentBudget = action.payload.entertainmentBudget;
                state.reminded = action.payload.reminded;
            })
    }
});

export const fetchCurrentUser = createAsyncThunk(
    "userEditor/fetchCurrentUser",
    async (userId: string, { rejectWithValue }) => {
        try {
            const response = await request({
                url: `${USER_SERVICE_URL}/${userId}`,
                method: 'GET',
            });
            const data = await response.data as any;
            return data;
        } catch (error) {
            return rejectWithValue("Failed to fetch user");
        }
    }
);

export const getUserByEmail = async (params: { email: string }) => {
    const endpoint = `${USER_SERVICE_URL}/email/${params.email}`;

    const response = await request({
        url: endpoint,
        method: 'GET',
    });
    const data = await response.data as any;
    return data;
}

export const getTotalAmount = async (params: { userId: string }) => {
    const endpoint = `${USER_SERVICE_URL}/${params.userId}/total-amount`;
    const response = await request({
        url: endpoint,
        method: 'GET',
    });
    const data = await response.data as any;
    return data;
}


export const getCategoryStatistics = async (params: { userId: string }) => {
    const endpoint = `${USER_SERVICE_URL}/${params.userId}/category-statistics`;
    const response = await request({
        url: endpoint,
        method: 'GET',
    });
    const data = await response.data as any;
    return data;
}

export const updateUser = createAsyncThunk(
    "userEditor/updateUser",
    async (params:
        {
            userId: string,
            name: string,
            email: string,
            totalBudget?: number,
            foodBudget?: number,
            entertainmentBudget?: number,
            reminded?: boolean
        }
        , { rejectWithValue }) => {
        try {
            const response = await request({
                url: `${USER_SERVICE_URL}/${params.userId}`,
                method: 'PUT',
                data: params
            });
            const data = await response.data as any;
            return data.data;
        } catch (error) {
            return rejectWithValue("Failed to update user");
        }
    }
);

export const { setCurrentUser } = userSlice.actions;

export default userSlice.reducer;
