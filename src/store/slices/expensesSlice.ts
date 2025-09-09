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
  bills?: Bill[]
}

