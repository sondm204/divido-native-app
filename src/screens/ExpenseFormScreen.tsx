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
  Animated,
  Dimensions,
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

/* ============================== TYPES ============================== */
type ID = string;

type SplitMode = "EQUAL" | "RATIO" | "EXACT";

type ExpenseFormParams = {
  mode: "create" | "edit";
  groupId: string;
  expenseId?: string;
  initial?: {
    categoryId: string;
    amount: number;
    payerId: string;
    spentAt: string;
    note?: string;
    shareRatios: { userId: string; ratio: number }[];
  };
};

type Props = {
  navigation: any;
  route: { params: ExpenseFormParams };
};

export default function ExpenseFormScreen({ navigation, route }: Props) {
  const { width } = Dimensions.get('window');
  
  // Enhanced Segment Component with better animations
  const Segment: React.FC<{
    value: SplitMode;
    current: SplitMode;
    onChange: (v: SplitMode) => void;
  }> = ({ current, onChange }) => {
    const slideAnim = useMemo(() => new Animated.Value(0), []);
    
    useEffect(() => {
      const index = ["EQUAL", "RATIO", "EXACT"].indexOf(current);
      Animated.spring(slideAnim, {
        toValue: index,
        useNativeDriver: false,
        tension: 150,
        friction: 8,
      }).start();
    }, [current, slideAnim]);
    
    return (
      <View className="bg-slate-100 rounded-2xl p-1 flex-row relative overflow-hidden">
        <Animated.View
          className="absolute bg-white rounded-xl shadow-sm"
          style={{
            left: slideAnim.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [4, width/3 - 8, (2*width/3) - 16],
            }),
            width: width/3 - 16,
            height: 36,
            top: 4,
          }}
        />
        {(["EQUAL", "RATIO", "EXACT"] as SplitMode[]).map((k, index) => (
          <TouchableOpacity
            key={k}
            onPress={() => onChange(k)}
            className="flex-1 px-4 py-2 items-center justify-center"
            style={{ zIndex: 1 }}
          >
            <Text className={`text-sm font-medium ${current === k ? "text-[#0F6BF0]" : "text-slate-600"}`}>
              {k === "EQUAL" ? "Chia đều" : k === "RATIO" ? "Theo tỷ lệ" : "Số tiền cụ thể"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const { mode, groupId, expenseId, initial } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  // Data states
  const [members, setMembers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form states with validation
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

  // Participants states
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [ratioInput, setRatioInput] = useState<Record<string, string>>({});
  const [exactInput, setExactInput] = useState<Record<string, string>>({});

  // Animation values
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const slideAnim = useMemo(() => new Animated.Value(50), []);

  // Computed values
  const selectedIds = useMemo<string[]>(
    () => members.filter((m: User) => selected[m.id]).map((m: User) => m.id),
    [members, selected]
  );

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Real-time form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!categoryId) errors.category = "Vui lòng chọn danh mục";
    if (!amount || parseInt(amount) <= 0) errors.amount = "Số tiền phải lớn hơn 0";
    if (!payerId) errors.payer = "Vui lòng chọn người trả tiền";
    if (selectedIds.length === 0) errors.participants = "Vui lòng chọn ít nhất 1 người tham gia";
    
    if (splitMode === "RATIO") {
      const hasValidRatio = selectedIds.some(id => {
        const ratio = parseFloat(ratioInput[id] || "0");
        return !isNaN(ratio) && ratio > 0;
      });
      if (!hasValidRatio) errors.ratio = "Vui lòng nhập tỷ lệ hợp lệ";
    }
    
    if (splitMode === "EXACT") {
      const total = selectedIds.reduce((sum, id) => {
        return sum + (parseInt(exactInput[id] || "0") || 0);
      }, 0);
      const targetAmount = parseInt(amount || "0") || 0;
      if (total !== targetAmount) {
        errors.exact = `Tổng phải bằng ${targetAmount.toLocaleString()}₫`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time validation on form changes
  useEffect(() => {
    validateForm();
  }, [categoryId, amount, payerId, selectedIds, splitMode, ratioInput, exactInput]);

  // Enhanced data fetching with better error handling
  useEffect(() => {
    (async () => {
      try {
        const [ms, cs]: [User[], Category[]] = await Promise.all([
          dispatch(fetchGroupMembers(groupId)).unwrap(),
          dispatch(fetchGroupCategories(groupId)).unwrap(),
        ]);
        setMembers(ms);
        setCategories(cs);

        // Auto-select all members by default
        const sel: Record<string, boolean> = {};
        ms.forEach((m: User) => {
          sel[m.id] = true;
        });
        setSelected(sel);

        // Initialize edit mode data
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

  const totalAmount = useMemo(() => {
    return parseInt(amount || "0", 10) || 0;
  }, [amount]);

  const amountPerPerson = useMemo(() => {
    if (splitMode === "EQUAL" && selectedIds.length > 0) {
      return Math.round(totalAmount / selectedIds.length);
    }
    return 0;
  }, [totalAmount, selectedIds.length, splitMode]);

  function toggleSelect(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function buildPayload() {
    if (!validateForm()) return null;

    const amt = parseInt(amount || "0", 10);
    let shareRatios: { user: { id: ID }; ratio: number }[] = [];

    if (splitMode === "EQUAL") {
      shareRatios = selectedIds.map((id) => ({ user: { id }, ratio: 1 }));
    } else if (splitMode === "RATIO") {
      shareRatios = selectedIds.map((id) => {
        const v = parseFloat(ratioInput[id] || "0");
        return { user: { id }, ratio: isNaN(v) ? 0 : v };
      });
    } else if (splitMode === "EXACT") {
      shareRatios = selectedIds.map((id) => {
        const v = parseInt(exactInput[id] || "0", 10);
        return { user: { id }, ratio: amt > 0 ? v / amt : 0 };
      });
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
      if (mode === "create") {
        await dispatch(postCreateExpense({ groupId, body: payload })).unwrap();
      } else {
        await dispatch(putUpdateExpense({ expenseId: expenseId as string, body: payload })).unwrap();
      }

      await dispatch(fetchExpenses(groupId));
      setLoading(false);
      navigation.goBack();
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Lỗi", e?.message || "Gửi dữ liệu thất bại");
    }
  }

  const isFormValid = Object.keys(formErrors).length === 0;
  const selectedCount = selectedIds.length;

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-b from-[#F7FAFF] to-[#E8F2FF]">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.View 
          className="flex-1"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <ScrollView 
            className="flex-1" 
            contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Enhanced Header */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-slate-800 mb-2">
                {mode === "create" ? "💰 Thêm chi tiêu" : "✏️ Sửa chi tiêu"}
              </Text>
              <Text className="text-lg text-slate-500">
                Quản lý chi tiêu nhóm dễ dàng & minh bạch
              </Text>
            </View>

            {/* Category Selection with enhanced design */}
            <AppSectionCard title="🏷️ Danh mục chi tiêu">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3 px-1">
                  {categories.length === 0 ? (
                    <View className="bg-slate-50 rounded-xl p-4 items-center justify-center min-w-[100px]">
                      <Text className="text-slate-400">Chưa có danh mục</Text>
                    </View>
                  ) : (
                    categories.map((c: Category, index) => (
                      <Animated.View
                        key={c.id}
                        style={{
                          transform: [{
                            scale: categoryId === c.id ? 1.05 : 1
                          }]
                        }}
                      >
                        <AppChip
                          label={c.name}
                          active={categoryId === c.id}
                          onPress={() => setCategoryId(c.id)}
                        />
                      </Animated.View>
                    ))
                  )}
                </View>
              </ScrollView>
              {formErrors.category && (
                <Text className="text-red-500 text-sm mt-2">⚠️ {formErrors.category}</Text>
              )}
            </AppSectionCard>

            {/* Enhanced Amount & Details */}
            <AppSectionCard title="💳 Thông tin chi tiêu">
              {/* Amount with enhanced styling */}
              <View className="mb-4">
                <Text className="text-sm text-slate-600 mb-2 font-medium">Số tiền</Text>
                <View className="relative">
                  <View className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <Text className="text-lg font-bold text-[#0F6BF0]">₫</Text>
                  </View>
                  <TextInput
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={(text) => {
                      // Format number with commas
                      const numericValue = text.replace(/[^0-9]/g, '');
                      setAmount(numericValue);
                    }}
                    placeholder="0"
                    className={`bg-white rounded-2xl border-2 p-4 pl-10 text-lg font-semibold ${
                      formErrors.amount ? "border-red-400" : amount ? "border-[#0F6BF0]" : "border-slate-200"
                    } shadow-sm`}
                    placeholderTextColor="#9CA3AF"
                  />
                  {totalAmount > 0 && (
                    <Text className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                      {totalAmount.toLocaleString()}
                    </Text>
                  )}
                </View>
                {formErrors.amount && (
                  <Text className="text-red-500 text-sm mt-1">⚠️ {formErrors.amount}</Text>
                )}
              </View>

              {/* Date input */}
              <View className="mb-4">
                <AppInput
                  label="📅 Ngày chi tiêu"
                  value={spentAt}
                  onChangeText={setSpentAt}
                  placeholder="2025-09-16"
                />
              </View>

              {/* Note */}
              <AppInput
                label="📝 Ghi chú (tùy chọn)"
                value={note}
                onChangeText={setNote}
                placeholder="Ví dụ: bữa tối, taxi, mua sắm..."
                multiline
                numberOfLines={2}
              />
            </AppSectionCard>

            {/* Enhanced Payer Selection */}
            <AppSectionCard title="👤 Người trả tiền">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-3 px-1">
                  {members.length === 0 ? (
                    <Text className="text-slate-400">Chưa có thành viên</Text>
                  ) : (
                    members.map((m: User) => (
                      <Animated.View
                        key={m.id}
                        style={{
                          transform: [{
                            scale: payerId === m.id ? 1.1 : 1
                          }]
                        }}
                      >
                        <AppAvatar
                          name={m.name}
                          active={payerId === m.id}
                          onPress={() => setPayerId(m.id)}
                        />
                      </Animated.View>
                    ))
                  )}
                </View>
              </ScrollView>
              {formErrors.payer && (
                <Text className="text-red-500 text-sm mt-2">⚠️ {formErrors.payer}</Text>
              )}
            </AppSectionCard>

            {/* Enhanced Participants */}
            <AppSectionCard
              title="👥 Người tham gia chia"
              extra={
                <View className="bg-[#0F6BF0] rounded-full px-3 py-1">
                  <Text className="text-white text-xs font-medium">{selectedCount} người</Text>
                </View>
              }
            >
              <View className="flex-row flex-wrap gap-2">
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
              {formErrors.participants && (
                <Text className="text-red-500 text-sm mt-2">⚠️ {formErrors.participants}</Text>
              )}
            </AppSectionCard>

            {/* Enhanced Split Mode */}
            <AppSectionCard title="⚖️ Cách chia tiền">
              <Segment value={splitMode} current={splitMode} onChange={setSplitMode} />
              
              {/* Split preview */}
              {splitMode === "EQUAL" && selectedCount > 0 && totalAmount > 0 && (
                <View className="mt-4 bg-blue-50 rounded-xl p-4">
                  <Text className="text-center text-[#0F6BF0] font-medium">
                    Mỗi người: {amountPerPerson.toLocaleString()}₫
                  </Text>
                </View>
              )}

              {splitMode === "RATIO" && (
                <View className="mt-4">
                  <Text className="text-slate-600 mb-3 font-medium">Nhập tỷ lệ cho từng người:</Text>
                  {selectedIds.map((id: string) => {
                    const name = members.find((m) => m.id === id)?.name ?? id;
                    const ratio = parseFloat(ratioInput[id] || "0");
                    return (
                      <View key={id} className="flex-row items-center mb-3 bg-white rounded-xl p-3 shadow-sm">
                        <Text className="w-24 text-slate-700 font-medium">{name}</Text>
                        <TextInput
                          className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-3 ml-3"
                          keyboardType="numeric"
                          value={ratioInput[id] || ""}
                          onChangeText={(t) => setRatioInput((s) => ({ ...s, [id]: t }))}
                          placeholder="1"
                          placeholderTextColor="#9CA3AF"
                        />
                        {ratio > 0 && totalAmount > 0 && (
                          <Text className="ml-2 text-[#0F6BF0] font-medium w-20 text-right">
                            {Math.round((ratio * totalAmount) / selectedIds.reduce((sum, id) => sum + parseFloat(ratioInput[id] || "0"), 0) || 0).toLocaleString()}₫
                          </Text>
                        )}
                      </View>
                    );
                  })}
                  {formErrors.ratio && (
                    <Text className="text-red-500 text-sm mt-1">⚠️ {formErrors.ratio}</Text>
                  )}
                </View>
              )}

              {splitMode === "EXACT" && (
                <View className="mt-4">
                  <View className="bg-amber-50 rounded-xl p-3 mb-3">
                    <Text className="text-amber-700 text-sm font-medium text-center">
                      💡 Tổng phải bằng {totalAmount.toLocaleString()}₫
                    </Text>
                  </View>
                  {selectedIds.map((id: string) => {
                    const name = members.find((m) => m.id === id)?.name ?? id;
                    const exactAmount = parseInt(exactInput[id] || "0") || 0;
                    return (
                      <View key={id} className="flex-row items-center mb-3 bg-white rounded-xl p-3 shadow-sm">
                        <Text className="w-24 text-slate-700 font-medium">{name}</Text>
                        <TextInput
                          className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-3 ml-3"
                          keyboardType="numeric"
                          value={exactInput[id] || ""}
                          onChangeText={(t) => setExactInput((s) => ({ ...s, [id]: t }))}
                          placeholder="0"
                          placeholderTextColor="#9CA3AF"
                        />
                        {exactAmount > 0 && (
                          <Text className="ml-2 text-[#0F6BF0] font-medium w-20 text-right">
                            {exactAmount.toLocaleString()}₫
                          </Text>
                        )}
                      </View>
                    );
                  })}
                  {formErrors.exact && (
                    <Text className="text-red-500 text-sm mt-1">⚠️ {formErrors.exact}</Text>
                  )}
                </View>
              )}
            </AppSectionCard>
          </ScrollView>

          {/* Enhanced Bottom Action Bar */}
          <View className="absolute left-0 right-0 bottom-0 bg-white border-t border-slate-200 p-5 shadow-lg">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-slate-600 text-sm">
                  Chia cho <Text className="font-bold text-[#0F6BF0]">{selectedCount}</Text> người
                </Text>
                <Text className="text-slate-900 font-bold text-xl">
                  {totalAmount.toLocaleString()}₫
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-slate-500 text-xs">Trạng thái</Text>
                <View className={`px-3 py-1 rounded-full ${isFormValid ? 'bg-green-100' : 'bg-red-100'}`}>
                  <Text className={`text-xs font-medium ${isFormValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isFormValid ? '✅ Sẵn sàng' : '⚠️ Thiếu thông tin'}
                  </Text>
                </View>
              </View>
            </View>
            
            <AppButton
              title={loading ? "⏳ Đang lưu..." : mode === "create" ? "Tạo chi tiêu" : "✅ Cập nhật"}
              onPress={handleSubmit}
              disabled={loading || !isFormValid}
              style={{
                backgroundColor: isFormValid ? '#0F6BF0' : '#9CA3AF',
                opacity: loading ? 0.7 : 1
              }}
            />
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}