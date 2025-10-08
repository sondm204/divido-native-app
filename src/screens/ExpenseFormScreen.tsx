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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import { fetchExpenses, fetchGroupCategories, fetchGroupMembers, postCreateExpense, putUpdateExpense } from "../store/slices/groupsSlice";
import { AppChip } from "../components/AppChip";
import { AppAvatar } from "../components/AppAvatar";
import { AppSectionCard } from "../components/AppSectionCard";
import { User } from "../store/slices/userSlice";
import { Category } from "../store/slices/expensesSlice";
import { uploadImage } from "../api/uploadService";
import * as ImagePicker from 'expo-image-picker';

type ID = string;

// Using User and Category types from Redux slices

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
    imageUrl?: string;
    shareRatios: { userId: string; ratio: number }[];
  };
};

type Props = {
  navigation: any;
  route: { params: ExpenseFormParams };
};


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
  const [members, setMembers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [imageUrl, setImageUrl] = useState<string>(initial?.imageUrl ?? "");
  const [splitMode, setSplitMode] = useState<SplitMode>("EQUAL");

  // participants
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [ratioInput, setRatioInput] = useState<Record<string, string>>({});
  const [exactInput, setExactInput] = useState<Record<string, string>>({});

  // fetch members, categories
  useEffect(() => {
    (async () => {
      try {
        const [ms, categoriesResult]: [User[], { groupId: string; categories: Category[] }] = await Promise.all([
          dispatch(fetchGroupMembers(groupId)).unwrap(),
          dispatch(fetchGroupCategories(groupId)).unwrap(),
        ]);
        setMembers(ms);
        setCategories(categoriesResult.categories);

        // chọn tất cả mặc định
        const sel: Record<string, boolean> = {};
        ms.forEach((m: User) => {
          sel[m.id] = true;
        });
        setSelected(sel);

        // nếu đang sửa ⇒ map lại selected & ratio
        if (initial?.shareRatios?.length) {
          const s2: Record<string, boolean> = {};
          ms.forEach((m: User) => (s2[m.id] = false));
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
    () => members.filter((m: User) => selected[m.id]).map((m: User) => m.id),
    [members, selected]
  );

  function toggleSelect(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Bạn cần cấp quyền để chọn ảnh 📷');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
  
      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
  
        const fileUri = asset.uri;
        const fileName = asset.fileName || 'image.jpg';
        const mimeType = getMimeType(fileName);
  
        setLoading(true);
        const uploadResult = await uploadImage(fileUri, fileName, mimeType);
        setImageUrl(uploadResult.data);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Tải ảnh thất bại, vui lòng thử lại.');
      console.error('Image upload error:', error);
    }
  };

  const getMimeType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  };

  function buildPayload() {
    const amt = parseInt(amount || "0", 10);
    if (!categoryId) return Alert.alert("Thiếu dữ liệu", "Chọn danh mục"), null;
    if (!payerId) return Alert.alert("Thiếu dữ liệu", "Chọn người trả"), null;
    if (!amt || amt <= 0) return Alert.alert("Thiếu dữ liệu", "Số tiền không hợp lệ"), null;
    if (!selectedIds.length)
      return Alert.alert("Thiếu dữ liệu", "Chọn người tham gia chia"), null;

    let shareRatios: { user: { id: ID }; ratio: number }[] = [];

    if (splitMode === "EQUAL") {
      const per = selectedIds.length > 0 ? 1 / selectedIds.length : 0;
      shareRatios = selectedIds.map((id) => ({ user: { id }, ratio: per }));
    } else if (splitMode === "RATIO") {
      const arr = selectedIds.map((id) => {
        const v = parseFloat(ratioInput[id] || "0");
        return { user: { id }, ratio: isNaN(v) ? 0 : v };
      });
      if (arr.every((x) => x.ratio <= 0)) {
        Alert.alert("Thiếu dữ liệu", "Nhập tỷ lệ hợp lệ (> 0)");
        return null;
      }
      // Use raw user-entered weights; backend can normalize when computing amounts
      shareRatios = arr;
    } else if (splitMode === "EXACT") {
      const values = selectedIds.map((id) => parseInt(exactInput[id] || "0", 10));
      const sum = values.reduce((s, v) => s + (isNaN(v) ? 0 : v), 0);
      if (sum !== amt) {
        Alert.alert("Sai tổng tiền", `Tổng EXACT = ${sum} phải bằng ${amt}`);
        return null;
      }
      // Store raw entered amounts as weights to avoid rounding; UI will normalize when displaying
      shareRatios = selectedIds.map((id, idx) => ({ user: { id }, ratio: isNaN(values[idx]) ? 0 : values[idx] }));
    }

    return {
      category: { id: categoryId },
      amount: amt,
      payer: { id: payerId },
      spentAt,
      note,
      imageUrl,
      shareRatios,
      bills: [],
    };
  }

  async function handleSubmit() {
    const payload = buildPayload();
    if (!payload) return;

    try {
      setLoading(true);
      if (mode === "create") await dispatch(postCreateExpense({ groupId, body: payload })).unwrap();
      else await dispatch(putUpdateExpense({ expenseId: expenseId as string, body: payload })).unwrap();

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
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <Text className="text-4xl font-bold mb-2 text-white text-center">
            {mode === "create" ? "Thêm chi tiêu" : "Sửa chi tiêu"}
          </Text>
          <Text className="text-slate-400 mb-4 text-center">Quản lý chi tiêu nhóm • nhanh & gọn</Text>

          {/* Category */}
          <AppSectionCard title="Danh mục">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.length === 0 ? (
                <Text className="text-slate-400">Chưa có danh mục</Text>
              ) : (
                categories.map((c: Category) => (
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
                <Text pointerEvents="none" className="absolute left-4 top-3.5 z-10 text-slate-400">₫</Text>
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

          {/* Image Upload */}
          <AppSectionCard title="Hình ảnh">
            <View className="flex-row items-center gap-4">
              {imageUrl ? (
                <View className="flex-row items-center gap-3">
                  <Image
                    source={{ uri: imageUrl }}
                    className="w-20 h-20 rounded-lg"
                    style={{ resizeMode: 'cover' }}
                  />
                  <TouchableOpacity
                    onPress={() => setImageUrl("")}
                    className="bg-red-500 px-3 py-2 rounded-lg"
                  >
                    <Text className="text-white text-sm">Xóa</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={pickImage}
                  className="border-2 border-dashed border-slate-300 rounded-lg p-4 items-center justify-center w-32 h-20"
                >
                  <Text className="text-slate-500 text-sm">+ Thêm ảnh</Text>
                </TouchableOpacity>
              )}
            </View>
          </AppSectionCard>


          {/* Payer */}
          <AppSectionCard title="Người trả">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {members.length === 0 ? (
                <Text className="text-slate-400">Chưa có thành viên</Text>
              ) : (
                members.map((m: User) => (
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
                members.map((m: User) => (
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
