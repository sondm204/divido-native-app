import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import { BILL_SERVICE_URL } from "@/src/commons/constants";

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
  imageUrl: string;
  shareRatios: ShareRatio[];
  bills?: Bill[],
  createdAt?: string;
}

export const createBill = createAsyncThunk(
  "bills/create",
  async (body: {
    expenseId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }) => {
    const res = await fetch(`${BILL_SERVICE_URL}`, {
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
