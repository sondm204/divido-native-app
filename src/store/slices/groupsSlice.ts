import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { User } from "./userSlice";
import { Bill, Category, Expense } from "./expensesSlice";
import { EXPENSE_SERVICE_URL, GROUP_SERVICE_URL } from "../../commons/constants";

// type cho Group
export interface Group {
  id: string;
  name: string;
  users?: User[];
  categories?: Category[];
  expenses?: Expense[];
  createdAt: string;
}

interface GroupsState {
  groups: Group[];
  currentGroup: Group | null;
  selectedGroupId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
  currentGroup: null,
  selectedGroupId: null,
  loading: false,
  error: null,
};

// thunk gọi API
export const fetchGroups = createAsyncThunk("groups/fetch", async () => {
  const res = await fetch(GROUP_SERVICE_URL);
  if (!res.ok) throw new Error("Failed to fetch groups");
  return (await res.json()) as Group[];
});

export const createGroup = createAsyncThunk(
  "groups/create",
  async (body: {
    name: string,
    users?: User[],
    createdAt: string
  }) => {
    const res = await fetch(GROUP_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed to create group");
    return (await res.json()) as Group;
  }
);

export const fetchExpenses = createAsyncThunk(
  "groups/fetchExpenses",
  async (groupId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${GROUP_SERVICE_URL}/${groupId}/expenses`);
      const data = await res.json();
      return {
        groupId,
        expenses: data
      };
    } catch (error) {
      return rejectWithValue("Failed to fetch expenses");
    }
  }
);

export const fetchBill = createAsyncThunk(
  "expenseEditor/fetchBill",
  async (expenseId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${EXPENSE_SERVICE_URL}/${expenseId}/bill`);
      const data = await response.json();
      return {
        expenseId,
        bill: data
      }
    } catch (error) {
      return rejectWithValue("Failed to fetch expenses");
    }
  }
)

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
    setCurrentGroup: (state, action: PayloadAction<Group | null>) => {
      state.currentGroup = action.payload;
      state.selectedGroupId = action.payload?.id || null;
    },
    setSelectedGroupId: (state, action: PayloadAction<string | null>) => {
      state.selectedGroupId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch groups
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action: PayloadAction<Group[]>) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error";
      })
      // create group
      .addCase(createGroup.fulfilled, (state, action: PayloadAction<Group>) => {
        state.groups.push(action.payload);
      })
      // fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<{ groupId: string; expenses: Expense[] }>) => {
        state.loading = false;
        const { groupId, expenses } = action.payload;
        const group = Array.isArray(state.groups) ? state.groups.find(group => group.id === groupId) || null : null;
        if (group) {
          group.expenses = expenses;
          state.currentGroup = group;
        }
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : (action.error.message ?? 'Error');
      })
      // fetch bill
      .addCase(fetchBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBill.fulfilled, (state, action) => {
        state.loading = false;
        const { expenseId, bill } = action.payload;
        const group = Array.isArray(state.groups) ? state.groups.find(group => group.id === state.selectedGroupId) || null : null;
        if (group) {
          const expense = group.expenses?.find(expense => expense.id === expenseId) || null;
          if (expense) {
            expense.bills = bill;
            state.currentGroup = group;
          }
        }
      })
      .addCase(fetchBill.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : (action.error.message ?? 'Error');
      });
  },
});

export default groupsSlice.reducer;

// selector
export const { setCurrentGroup, setSelectedGroupId } = groupsSlice.actions;