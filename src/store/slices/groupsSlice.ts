import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { User } from "./userSlice";
import { Bill, Category, Expense, ShareRatio } from "./expensesSlice";
import { BILL_SERVICE_URL, EXPENSE_SERVICE_URL, GROUP_SERVICE_URL } from "../../commons/constants";

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
  selectedGroupId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: GroupsState = {
  groups: [],
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

export const updateGroup = createAsyncThunk(
  "groups/update",
  async (body: {
    id: string,
    name: string,
    users?: User[],
    createdAt: string
  }) => {
    const res = await fetch(`${GROUP_SERVICE_URL}/${body.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error("Failed to update group");
    return (await res.json()) as Group;
  }
);

export const deleteGroup = createAsyncThunk(
  "groups/delete",
  async (groupId: string) => {
    const res = await fetch(`${GROUP_SERVICE_URL}/${groupId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete group");
    return groupId;
  }
);

export const fetchExpenses = createAsyncThunk(
  "groups/fetchExpenses",
  async (groupId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(`${GROUP_SERVICE_URL}/${groupId}/expenses`);
      const data = await res.json();
      const expenses = data.map((expense: any) => ({
        ...expense,
        shareRatios: expense.shareRatios.map((s: any) => ({
          username: s.user.name,
          ratio: s.ratio
        })) as ShareRatio[]
      }));
      return {
        groupId,
        expenses: expenses
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

export const createBill = createAsyncThunk(
  "expenseEditor/createBill",
  async (body: {
    expenseId: string;
    bill: Bill;
  }) => {
    console.log(body);
    const res = await fetch(`${EXPENSE_SERVICE_URL}/${body.expenseId}/bill`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body.bill)
    });
    if (!res.ok) throw new Error("Failed to create bill");
    const data = await res.json();
    return {
      expenseId: body.expenseId,
      bill: data.data
    }
  }
)

export const updateBill = createAsyncThunk(
  "expenseEditor/updateBill",
  async (body: {
    id: string;
    bill: Bill;
  }) => {
    console.log(body);
    const res = await fetch(`${BILL_SERVICE_URL}/${body.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body.bill)
    });
    if (!res.ok) throw new Error("Failed to update bill");
    const data = await res.json();
    return {
      id: body.id,
      bill: data.data
    }
  }
)

const groupsSlice = createSlice({
  name: "groups",
  initialState,
  reducers: {
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
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGroup.fulfilled, (state, action: PayloadAction<Group>) => {
        state.loading = false;
        // Add the new group to the list
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to create group";
      })
      // update group
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action: PayloadAction<Group>) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.groups.findIndex(g => g.id === updated.id);
        if (index !== -1) {
          state.groups[index] = updated;
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to update group";
      })
      // delete group
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.groups = state.groups.filter(group => group.id !== action.payload);
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to delete group";
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
            expense.bills = Array.isArray(bill) ? bill : [bill];
          }
        }
      })
      .addCase(fetchBill.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : (action.error.message ?? 'Error');
      })
      // create bill
      .addCase(createBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBill.fulfilled, (state, action: PayloadAction<{ expenseId: string; bill: Bill }>) => {
        state.loading = false;
        const { expenseId, bill } = action.payload;
        const group = Array.isArray(state.groups) ? state.groups.find(group => group.id === state.selectedGroupId) || null : null;
        if (group) {
          const expense = group.expenses?.find(expense => expense.id === expenseId) || null;
          if (expense) {
            expense.bills = [...(expense.bills || []), bill];
          } else {
            state.error = "Failed to create bill";
          }
        } else {
          state.error = "Failed to create bill";
        }
      })
      .addCase(createBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to create bill";
      })
      // update bill
      .addCase(updateBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBill.fulfilled, (state, action: PayloadAction<{ id: string; bill: Bill }>) => {
        state.loading = false;
        const { id, bill } = action.payload;
        const group = Array.isArray(state.groups) ? state.groups.find(group => group.id === state.selectedGroupId) || null : null;
        if (!group || !group.expenses) return;
        for (const expense of group.expenses) {
          if (!expense.bills) continue;
          const idx = expense.bills.findIndex(b => b.id === id);
          if (idx !== -1) {
            expense.bills[idx] = bill;
            break;
          }
        }
      })
      .addCase(updateBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to update bill";
      });
  },
});

export default groupsSlice.reducer;

export const { setSelectedGroupId } = groupsSlice.actions;