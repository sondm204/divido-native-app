import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

export interface Bill {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  owner: User[];
}

export interface ShareRatio {
  username: string;
  ratio: number;
}
export interface Category {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Expense {
  id: string;
  category: Category;
  amount: number;
  payer: User;
  spentAt: Date;
  note: string;
  shareRatios: ShareRatio[];
  bills?: Bill[];
}

export const createBill = createAsyncThunk(
  "bills/create",
  async (body: {
    expenseId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }) => {
    const res = await fetch(BILL_SERVICE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: body.name,
        quantity: body.quantity,
        unitPrice: body.unitPrice,
        expense: { id: body.expenseId }, //
      }),
    });

    if (!res.ok) throw new Error("Failed to create Bill");

    // vì backend trả về ApiResponse<BillDTO>
    const apiResponse = await res.json();

    return apiResponse.data as Bill; // 👈 data chính là BillDTO
  }
);

// ✅ slice bills (cơ bản)
interface BillsState {
  bills: Bill[];
  loading: boolean;
  error: string | null;
}

const initialState: BillsState = {
  bills: [],
  loading: false,
  error: null,
};

const billsSlice = createSlice({
  name: "bills",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBill.fulfilled, (state, action: PayloadAction<Bill>) => {
        state.loading = false;
        state.bills.push(action.payload); // ✅ thêm bill mới vào danh sách
      })
      .addCase(createBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Error";
      });
  },
});

export default billsSlice.reducer;