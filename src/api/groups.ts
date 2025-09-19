// --- EXPENSE APIs & helpers ---

const BASE_URL = "https://divido-be.onrender.com";

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg = j?.message || j?.error || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// Lấy members của group (fallback sang /groups/:id nếu cần)
export async function fetchGroupMembers(groupId: string) {
  const r1 = await fetch(`${BASE_URL}/groups/${groupId}/members`);
  if (r1.ok) return r1.json();
  // fallback
  const g = await http<any>(`${BASE_URL}/groups/${groupId}`);
  return g?.members || g?.users || [];
}

// Lấy categories của group (fallback sang /groups/:id nếu cần)
export async function fetchGroupCategories(groupId: string) {
  const r1 = await fetch(`${BASE_URL}/groups/${groupId}/categories`);
  if (r1.ok) return r1.json();
  // fallback
  const g = await http<any>(`${BASE_URL}/groups/${groupId}`);
  return g?.categories || [];
}

// Payload BE đang dùng cho ExpenseDTO (theo code Spring bạn đã gửi)
export type ExpenseUpsertPayload = {
  category: { id: string };
  amount: number;
  payer: { id: string };
  spentAt: string; // yyyy-MM-dd
  note?: string;
  shareRatios: { user: { id: string }; ratio: number }[];
  bills: any[]; // tạm để trống []
};

// Tạo expense trong group
export async function createExpense(groupId: string, body: ExpenseUpsertPayload) {
  return http(`${BASE_URL}/groups/${groupId}/expenses`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// Sửa expense theo id
export async function updateExpense(expenseId: string, body: ExpenseUpsertPayload) {
  return http(`${BASE_URL}/expenses/${expenseId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
