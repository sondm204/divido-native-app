// src/screens/ExpenseFormScreen.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchExpenses } from "../store/slices/groupsSlice";
import { Segment, SegmentOption } from "../components/Segment";
import { AppChip } from "../components/AppChip";
import { AppAvatar } from "../components/AppAvatar";
import { AppSectionCard } from "../components/AppSectionCard";

/* ============================== TYPES ============================== */
type ID = string;

type UserLite = { id: ID; name: string; email?: string };
type CategoryLite = { id: ID; name: string };

type SplitMode = "EQUAL" | "RATIO" | "EXACT";

type ExpenseFormParams = {
  mode: "create" | "edit";
  groupId: string;
  expenseId?: string;
  initial?: {
    categoryId: string;
    amount: number;
    payerId: string;
    spentAt: string; // yyyy-MM-dd
    note?: string;
    shareRatios: { userId: string; ratio: number }[];
  };
};

type Props = {
  navigation: any;
  route: { params: ExpenseFormParams };
};

/* ============================== API RAW ============================ */
const BASE_URL = "https://divido-be.onrender.com";

// Thành viên nhóm (fallback sang GET /groups/:id nếu không có /members)
async function fetchGroupMembers(groupId: string): Promise<UserLite[]> {
  const a = await fetch(`${BASE_URL}/groups/${groupId}/members`);
  if (a.ok) return a.json();

  const b = await fetch(`${BASE_URL}/groups/${groupId}`);
  if (b.ok) {
    const data = await b.json();
    if (Array.isArray(data.members)) return data.members;
    if (Array.isArray(data.users)) return data.users;
  }
  throw new Error("Failed to fetch members");
}

// Danh mục
async function fetchGroupCategories(groupId: string): Promise<CategoryLite[]> {
  const a = await fetch(`${BASE_URL}/groups/${groupId}/categories`);
  if (a.ok) return a.json();

  const b = await fetch(`${BASE_URL}/groups/${groupId}`);
  if (b.ok) {
    const data = await b.json();
    if (Array.isArray(data.categories)) return data.categories;
  }
  throw new Error("Failed to fetch categories");
}

// Tạo / Cập nhật expense
async function postCreateExpense(groupId: string, body: unknown) {
  const res = await fetch(`${BASE_URL}/groups/${groupId}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Fail to create expense");
  }
  return res.json();
}

async function putUpdateExpense(expenseId: string, body: unknown) {
  const res = await fetch(`${BASE_URL}/expenses/${expenseId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || "Fail to update expense");
  }
  return res.json();
}

/* ============================== MAIN SCREEN ======================= */
export default function ExpenseFormScreen({ navigation, route }: Props) {
  const Segment: React.FC<{
    value: SplitMode;
    current: SplitMode;
    onChange: (v: SplitMode) => void;
  }> = ({ current, onChange }) => (
    <View className="bg-slate-100 rounded-xl p-1 flex-row">
      {(["EQUAL", "RATIO", "EXACT"] as SplitMode[]).map((k) => (
        <TouchableOpacity
          key={k}
          onPress={() => onChange(k)}
          className={`px-3 py-2 rounded-lg ${current === k ? "bg-white shadow" : ""}`}
        >
          <Text className={`text-xs font-medium ${current === k ? "text-[#0F6BF0]" : "text-slate-600"}`}>
            {k}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
  const { mode, groupId, expenseId, initial } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  // data
  const [members, setMembers] = useState<UserLite[]>([]);
  const [categories, setCategories] = useState<CategoryLite[]>([]);
  const [loading, setLoading] = useState(false);

  // form state
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ?? "");
  const [amount, setAmount] = useState<string>(
    initial?.amount != null ? String(initial.amount) : ""
  );
  const [payerId, setPayerId] = useState<string>(initial?.payerId ?? "");
  const [spentAt, setSpentAt] = useState<string>(
    initial?.spentAt ?? new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState<string>(initial?.note ?? "");
  const [splitMode, setSplitMode] = useState<SplitMode>("EQUAL");
  const options: SegmentOption<SplitMode>[] = [
    { label: "Equal", value: "EQUAL" },
    { label: "Ratio", value: "RATIO" },
    { label: "Exact", value: "EXACT" },
  ];

  // participants
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [ratioInput, setRatioInput] = useState<Record<string, string>>({});
  const [exactInput, setExactInput] = useState<Record<string, string>>({});

  // fetch members, categories
  useEffect(() => {
    (async () => {
      try {
        const [ms, cs]: [UserLite[], CategoryLite[]] = await Promise.all([
          fetchGroupMembers(groupId),
          fetchGroupCategories(groupId),
        ]);
        setMembers(ms);
        setCategories(cs);

        // chọn tất cả mặc định
        const sel: Record<string, boolean> = {};
        ms.forEach((m: UserLite) => {
          sel[m.id] = true;
        });
        setSelected(sel);

        // nếu đang sửa ⇒ map lại selected & ratio
        if (initial?.shareRatios?.length) {
          const s2: Record<string, boolean> = {};
          ms.forEach((m: UserLite) => (s2[m.id] = false));
          initial.shareRatios.forEach((r) => (s2[r.userId] = true));
          setSelected(s2);

          const r2: Record<string, string> = {};
          initial.shareRatios.forEach((r) => (r2[r.userId] = String(r.ratio)));
          setRatioInput(r2);
        }
      } catch (e: any) {
        Alert.alert("Lỗi", e?.message || "Không tải được dữ liệu nhóm");
      }
    })();
  }, [groupId, initial?.shareRatios]);

  const selectedIds = useMemo<string[]>(
    () => members.filter((m: UserLite) => selected[m.id]).map((m: UserLite) => m.id),
    [members, selected]
  );

  function toggleSelect(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function buildPayload() {
    const amt = parseInt(amount || "0", 10);
    if (!categoryId) return Alert.alert("Thiếu dữ liệu", "Chọn danh mục"), null;
    if (!payerId) return Alert.alert("Thiếu dữ liệu", "Chọn người trả"), null;
    if (!amt || amt <= 0) return Alert.alert("Thiếu dữ liệu", "Số tiền không hợp lệ"), null;
    if (!selectedIds.length)
      return Alert.alert("Thiếu dữ liệu", "Chọn người tham gia chia"), null;

    let shareRatios: { user: { id: ID }; ratio: number }[] = [];

    if (splitMode === "EQUAL") {
      shareRatios = selectedIds.map((id) => ({ user: { id }, ratio: 1 }));
    } else if (splitMode === "RATIO") {
      const arr = selectedIds.map((id) => {
        const v = parseFloat(ratioInput[id] || "0");
        return { user: { id }, ratio: isNaN(v) ? 0 : v };
      });
      if (arr.every((x) => x.ratio <= 0)) {
        Alert.alert("Thiếu dữ liệu", "Nhập tỷ lệ hợp lệ (> 0)");
        return null;
      }
      shareRatios = arr;
    } else if (splitMode === "EXACT") {
      let sum = 0;
      const arr = selectedIds.map((id) => {
        const v = parseInt(exactInput[id] || "0", 10);
        sum += v;
        return { user: { id }, ratio: amt > 0 ? v / amt : 0 };
      });
      if (sum !== amt) {
        Alert.alert("Sai tổng tiền", `Tổng EXACT = ${sum} phải bằng ${amt}`);
        return null;
      }
      shareRatios = arr;
    }

    return {
      category: { id: categoryId },
      amount: amt,
      payer: { id: payerId },
      spentAt,
      note,
      shareRatios,
      bills: [],
    };
  }

  async function handleSubmit() {
    const payload = buildPayload();
    if (!payload) return;

    try {
      setLoading(true);
      if (mode === "create") await postCreateExpense(groupId, payload);
      else await putUpdateExpense(expenseId as string, payload);

      await dispatch(fetchExpenses(groupId));
      setLoading(false);
      navigation.goBack();
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Lỗi", e?.message || "Gửi dữ liệu thất bại");
    }
  }

  const selectedCount = selectedIds.length;

  return (
    <SafeAreaView className="flex-1 bg-[#F7FAFF]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <Text className="text-2xl font-bold mb-2">
            {mode === "create" ? "Thêm chi tiêu" : "Sửa chi tiêu"}
          </Text>
          <Text className="text-slate-500 mb-4">Quản lý chi tiêu nhóm • nhanh & gọn</Text>

          {/* Category */}
          <AppSectionCard title="Danh mục">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.length === 0 ? (
                <Text className="text-slate-400">Chưa có danh mục</Text>
              ) : (
                categories.map((c: CategoryLite) => (
                  <AppChip
                    key={c.id}
                    label={c.name}
                    active={categoryId === c.id}
                    onPress={() => setCategoryId(c.id)}
                  />
                ))
              )}
            </ScrollView>
          </AppSectionCard>

          {/* Amount + Date + Note */}
          <AppSectionCard title="Thông tin chi">
            {/* Amount */}
            <View className="mb-3">
              <Text className="text-sm text-slate-600 mb-2">Số tiền</Text>
              <View className="relative">
                <Text className="absolute left-4 top-3.5 text-slate-400">₫</Text>
                <TextInput
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  className={`bg-white rounded-2xl border p-3 pl-7 ${!amount ? "border-red-400" : "border-slate-200"
                    }`}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              {!amount && <Text className="text-xs text-red-500 mt-1">Bắt buộc</Text>}
            </View>

            <AppInput
              label="Ngày chi (yyyy-MM-dd)"
              value={spentAt}
              onChangeText={setSpentAt}
              placeholder="2025-09-16"
            />

            <View className="mt-3">
              <AppInput
                label="Ghi chú"
                value={note}
                onChangeText={setNote}
                placeholder="Ví dụ: bữa tối, taxi..."
              />
            </View>
          </AppSectionCard>

          {/* Payer */}
          <AppSectionCard title="Người trả">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {members.length === 0 ? (
                <Text className="text-slate-400">Chưa có thành viên</Text>
              ) : (
                members.map((m: UserLite) => (
                  <AppAvatar
                    key={m.id}
                    name={m.name}
                    active={payerId === m.id}
                    onPress={() => setPayerId(m.id)}
                  />
                ))
              )}
            </ScrollView>
          </AppSectionCard>

          {/* Participants */}
          <AppSectionCard
            title="Người tham gia chia"
            extra={<Text className="text-slate-500 text-xs">Đang chọn: {selectedCount}</Text>}
          >
            <View className="flex-row flex-wrap">
              {members.length === 0 ? (
                <Text className="text-slate-400">Chưa có thành viên</Text>
              ) : (
                members.map((m: UserLite) => (
                  <AppAvatar
                    key={m.id}
                    name={m.name}
                    small
                    active={!!selected[m.id]}
                    onPress={() => toggleSelect(m.id)}
                  />
                ))
              )}
            </View>
          </AppSectionCard>

          {/* Split mode + editors */}
          <AppSectionCard title="Cách chia">
            <Segment value={splitMode} current={splitMode} onChange={(v) => setSplitMode(v as SplitMode)} />
            {/* <View style={{ padding: 16 }}>
              <Segment
                options={options}
                current={splitMode}
                onChange={(mode) => {
                  setSplitMode(mode);
                }}
              />
            </View> */}
            {splitMode === "RATIO" && (
              <View className="mt-4">
                {selectedIds.map((id: string) => {
                  const name = members.find((m) => m.id === id)?.name ?? id;
                  return (
                    <View key={id} className="flex-row items-center mb-2">
                      <Text className="w-28 text-slate-700">{name}</Text>
                      <TextInput
                        className="flex-1 bg-white rounded-xl border border-slate-200 p-3"
                        keyboardType="numeric"
                        value={ratioInput[id] || ""}
                        onChangeText={(t) => setRatioInput((s) => ({ ...s, [id]: t }))}
                        placeholder="1"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  );
                })}
              </View>
            )}

            {splitMode === "EXACT" && (
              <View className="mt-4">
                <Text className="text-slate-500 mb-2 text-xs">
                  Tổng EXACT phải bằng số tiền phía trên.
                </Text>
                {selectedIds.map((id: string) => {
                  const name = members.find((m) => m.id === id)?.name ?? id;
                  return (
                    <View key={id} className="flex-row items-center mb-2">
                      <Text className="w-28 text-slate-700">{name}</Text>
                      <TextInput
                        className="flex-1 bg-white rounded-xl border border-slate-200 p-3"
                        keyboardType="numeric"
                        value={exactInput[id] || ""}
                        onChangeText={(t) => setExactInput((s) => ({ ...s, [id]: t }))}
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </AppSectionCard>
        </ScrollView>

        {/* Bottom action */}
        <View className="absolute left-0 right-0 bottom-0 bg-white border-t p-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-slate-600">
              Chia cho <Text className="font-semibold">{selectedCount}</Text> người
            </Text>
            <Text className="text-slate-900 font-bold">
              ₫{(parseInt(amount || "0", 10) || 0).toLocaleString()}
            </Text>
          </View>
          <AppButton
            title={loading ? "Đang lưu..." : mode === "create" ? "Tạo chi tiêu" : "Cập nhật"}
            onPress={handleSubmit}
            disabled={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
