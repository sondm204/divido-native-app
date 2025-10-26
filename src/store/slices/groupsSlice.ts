import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { User } from "./userSlice";
import { Bill, Category, Expense, ShareRatio } from "./expensesSlice";
import { BILL_SERVICE_URL, EXPENSE_SERVICE_URL, GROUP_SERVICE_URL } from "../../commons/constants";
import { getToken } from "@/src/utils/utils";
import { request } from "@/src/utils/callApi";

// type cho Group
export interface Group {
  id: string;
  name: string;
  users?: User[];
  categories?: Category[];
  expenses?: Expense[];
  createdAt: string;
  totalAmount?: number;
  totalUserAmount?: number;
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
  const response = await request({
    url: GROUP_SERVICE_URL,
    method: "GET",
  });
  if (response.status !== 200) throw new Error("Failed to fetch groups");
  return (await response.data) as Group[];
});

export const createGroup = createAsyncThunk(
  "groups/create",
  async (body: {
    name: string,
    users?: User[],
    createdAt: string
  }) => {
    const response = await request({
      url: GROUP_SERVICE_URL,
      method: "POST",
      data: body,
    });
    if (response.status !== 200) throw new Error("Failed to create group");
    const data = await response.data as any;
    return data.data as Group;
  }
);

export const updateGroup = createAsyncThunk(
  "groups/update",
  async (body: {
    id: string,
    name: string,
    users?: User[],
    categories?: Category[],
    createdAt: string
  }) => {
    const response = await request({
      url: `${GROUP_SERVICE_URL}/${body.id}`,
      method: "PUT",
      data: body,
    });
    if (response.status !== 200) throw new Error("Failed to update group");
    const data = await response.data as any;
    return data.data as Group;
  }
);

export const deleteGroup = createAsyncThunk(
  "groups/delete",
  async (groupId: string) => {
    const response = await request({
      url: `${GROUP_SERVICE_URL}/${groupId}`,
      method: "DELETE",
    });
    if (response.status !== 200) throw new Error("Failed to delete group");
    return groupId;
  }
);

export const fetchExpenses = createAsyncThunk(
  "groups/fetchExpenses",
  async ({ groupId, month, year }: { groupId: string; month?: number; year?: number }, { rejectWithValue }) => {
    try {
      let url = `${GROUP_SERVICE_URL}/${groupId}/expenses`;
      const params = new URLSearchParams();
      
      if (month !== undefined) {
        params.append('month', month.toString());
      }
      if (year !== undefined) {
        params.append('year', year.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await request({
        url,
        method: "GET",
      });
      const data = await response.data as Expense[];
      const expenses = data.map((expense: Expense) => ({
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

export const fetchGroupMembers = createAsyncThunk(
  "groups/fetchGroupMembers",
  async (groupId: string, { rejectWithValue }) => {
    try {
      // Try the specific users endpoint first
      try {
        const response = await request({
          url: `${GROUP_SERVICE_URL}/${groupId}/users`,
          method: "GET",
        });
        if (response.status === 200) return await response.data;
      } catch (error) {
        // If users endpoint fails, try fallback to group endpoint
        console.log("Users endpoint failed, trying group endpoint:", error);
      }
      
      // Fallback to group endpoint
      const groupRes = await request({
        url: `${GROUP_SERVICE_URL}/${groupId}`,
        method: "GET",
      });
      if (groupRes.status === 200) {
        const data = await groupRes.data as any;
        return data.members || data.users || [];
      }
      throw new Error("Failed to fetch members");
    } catch (error) {
      return rejectWithValue("Failed to fetch group members");
    }
  }
);

export const fetchGroupCategories = createAsyncThunk(
  "groups/fetchGroupCategories",
  async (groupId: string, { rejectWithValue }) => {
    try {
      // Try the specific categories endpoint first
      try {
        const res = await request({
          url: `${GROUP_SERVICE_URL}/${groupId}/categories`,
          method: "GET",
        });
        if (res.status === 200) return { groupId, categories: await res.data };
      } catch (error) {
        // If categories endpoint fails, try fallback to group endpoint
        console.log("Categories endpoint failed, trying group endpoint:", error);
      }
      
      // Fallback to group endpoint
      const groupRes = await request({
        url: `${GROUP_SERVICE_URL}/${groupId}`,
        method: "GET",
      });
      if (groupRes.status === 200) {
        const data = await groupRes.data as any;
        return { groupId, categories: data.categories || [] };
      }
      throw new Error("Failed to fetch categories");
    } catch (error) {
      return rejectWithValue("Failed to fetch group categories");
    }
  }
);

export const createCategory = createAsyncThunk(
  "groups/createCategory",
  async (body: {
    name: string,
    groupId: string
  }) => {
    const response = await request({
      url: `${GROUP_SERVICE_URL}/${body.groupId}/categories`,
      method: "POST",
      data: { name: body.name },
    });
    if (response.status !== 200) throw new Error("Failed to create category");
    const data = await response.data as any;
    const category = data.data as Category;
    return {
      groupId: body.groupId,
      category: category
    };
  }
);

export const updateCategory = createAsyncThunk(
  "groups/updateCategory",
  async (body: {
    id: string,
    name: string,
    groupId: string
  }) => {
    const response = await request({
      url: `${GROUP_SERVICE_URL}/${body.groupId}/categories/${body.id}`,
      method: "PUT",
      data: { name: body.name },
    });
    if (response.status !== 200) throw new Error("Failed to update category");
    const data = await response.data as any;
    const category = data.data as Category;
    return {
      groupId: body.groupId,
      category: category
    };
  }
);

export const deleteCategory = createAsyncThunk(
  "groups/deleteCategory",
  async (body: {
    id: string,
    groupId: string
  }) => {
    const response = await request({
      url: `${GROUP_SERVICE_URL}/${body.groupId}/categories/${body.id}`,
      method: "DELETE",
    });
    if (response.status !== 200) throw new Error("Failed to delete category");
    return {
      groupId: body.groupId,
      id: body.id
    }
  }
);


export const postCreateExpense = createAsyncThunk(
  "groups/postCreateExpense",
  async ({ groupId, body }: { groupId: string; body: unknown }) => {
    const response = await request({
      url: `${GROUP_SERVICE_URL}/${groupId}/expenses`,
      method: "POST",
      data: body,
    });
    if (response.status !== 200) {
      const msg = await response.data as any;
      throw new Error(msg || "Fail to create expense");
    }
    const data = await response.data as any;
    return {
      success: data.success,
      message: data.message,
      data: data.data,
      warning: data.warning
    };
  }
);

export const putUpdateExpense = createAsyncThunk(
  "groups/putUpdateExpense",
  async ({ expenseId, body }: { expenseId: string; body: unknown }) => {
    const response = await request({
      url: `${EXPENSE_SERVICE_URL}/${expenseId}`,
      method: "PUT",
      data: body,
    });
    if (response.status !== 200) {
      const msg = await response.data as any;
      throw new Error(msg || "Fail to update expense");
    }
    const data = await response.data as any;
    return {
      success: data.success,
      message: data.message,
      data: data.data,
      warning: data.warning
    };
  }
);

export const fetchBill = createAsyncThunk(
  "expenseEditor/fetchBill",
  async (expenseId: string, { rejectWithValue }) => {
    try {
      const response = await request({
        url: `${EXPENSE_SERVICE_URL}/${expenseId}/bill`,
        method: "GET",
      });
      const data = await response.data as any;
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
    const response = await request({
      url: `${EXPENSE_SERVICE_URL}/${body.expenseId}/bill`,
      method: "POST",
      data: body.bill,
    });
    if (response.status !== 200) throw new Error("Failed to create bill");
    const data = await response.data as any;
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
    const response = await request({
      url: `${BILL_SERVICE_URL}/${body.id}`,
      method: "PUT",
      data: body.bill,
    });
    if (response.status !== 200) throw new Error("Failed to update bill");
    const data = await response.data as any;
    return {
      id: body.id,
      bill: data.data
    }
  }
)

export const deleteBill = createAsyncThunk(
  "expenseEditor/deleteBill",
  async (billId: string) => {
    const response = await request({
      url: `${BILL_SERVICE_URL}/${billId}`,
      method: "DELETE",
    });
    if (response.status !== 200) throw new Error("Failed to delete bill");
    return billId;
  }
)

export const deleteMultipleBills = createAsyncThunk(
  "expenseEditor/deleteMultipleBills",
  async (billIds: string[]) => {
    const ids = billIds.join(",");
    const response = await request({
      url: `${BILL_SERVICE_URL}?ids=${ids}`,
      method: "DELETE",
    });
    if (response.status !== 200) throw new Error("Failed to delete bills");
    return billIds;
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
      })
      // create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action: PayloadAction<{ groupId: string; category: Category }>) => {
        state.loading = false;
        const { groupId, category } = action.payload;
        const group = Array.isArray(state.groups) ? state.groups.find(group => group.id === groupId) || null : null;
        if (group) {
          group.categories = [...(group.categories || []), category];
        }
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to create category";
      })
      // update category
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action: PayloadAction<{ groupId: string; category: Category }>) => {
        state.loading = false;
        const { groupId, category } = action.payload;
        const group = Array.isArray(state.groups) ? state.groups.find(group => group.id === groupId) || null : null;
        if (group) {
          group.categories = [...(group.categories || []), category];
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to update category";
      })
      // delete category
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action: PayloadAction<{ groupId: string; id: string }>) => {
        state.loading = false;
        const { groupId, id } = action.payload;
        const group = Array.isArray(state.groups) ? state.groups.find(group => group.id === groupId) || null : null;
        if (group) {
          group.categories = group.categories?.filter(category => category.id !== id) || [];
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to delete category";
      })
      // fetch group categories
      .addCase(fetchGroupCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroupCategories.fulfilled, (state, action: PayloadAction<{ groupId: string; categories: Category[] }>) => {
        state.loading = false;
        const { groupId, categories } = action.payload;
        // Find the group and update its categories
        const group = state.groups.find(group => group.id === groupId);
        if (group) {
          group.categories = categories;
        }
      })
      .addCase(fetchGroupCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : (action.error.message ?? 'Error');
      })
  },
});

export default groupsSlice.reducer;

export const { setSelectedGroupId } = groupsSlice.actions;