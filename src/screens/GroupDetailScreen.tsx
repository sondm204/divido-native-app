import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, TouchableOpacity, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppDispatch, RootState } from "../store/store";
import { Expense } from "../store/slices/expensesSlice";
import { fetchExpenses, fetchGroupCategories, Group } from "../store/slices/groupsSlice";
import LoadingOverlay from "../components/LoadingOverlay";
import type { RootStackParamList } from "../../App";

type Props = NativeStackScreenProps<RootStackParamList, "GroupDetail">;

export default function GroupDetailScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const groups = useSelector((state: RootState) => state.groups.groups);
  const group = groups.find((g) => g.id === groupId) as Group | undefined;
  const expenses = group?.expenses ?? [];
  const loading = useSelector((state: RootState) => state.groups.loading);

  useEffect(() => {
    if (!expenses || expenses.length === 0) {
      dispatch(fetchExpenses(groupId));
    }
    // Fetch categories for the group
    dispatch(fetchGroupCategories(groupId));
  }, [dispatch, groupId, expenses?.length]);

  useEffect(() => {
    console.log(group);
  }, [group]);

  const toYMDLocal = (v: string | Date): string => {
    if (!v) return "";
    const d = typeof v === "string" ? new Date(v) : v;
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  function goCreateExpense() {
    navigation.navigate("ExpenseForm", { mode: "create", groupId });
  }

  function goEditExpense(item: Expense) {
    navigation.navigate("ExpenseForm", {
      mode: "edit",
      groupId,
      expenseId: item.id,
      initial: {
        categoryId: item.category.id,
        amount: item.amount,
        payerId: item.payer.id,
        spentAt: toYMDLocal(item.spentAt),
        note: item.note,
        shareRatios: (item.shareRatios ?? []).map((sr: any) => ({
          userId: sr.user?.id ?? sr.userId,
          ratio: Number(sr.ratio),
        })),
      },
    });
  }

  function renderExpense({ item }: { item: Expense }) {
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("ExpenseDetail", { expenseId: item.id })}
        onLongPress={() => goEditExpense(item)}
        delayLongPress={300}
        className="mx-3 my-1 p-3 bg-white rounded-lg shadow-sm"
      >
        <View className="flex-row justify-between">
          <Text className="font-semibold">{item.payer.name}</Text>
          <Text className="font-bold text-slate-900">₫{item.amount.toLocaleString()}</Text>
        </View>
        <Text className="text-slate-500 mt-1">{item.note}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="px-4 py-3 flex-row items-center justify-between">
        <Text className="text-lg font-bold">{group?.name}</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("GroupForm", { type: "edit", groupData: group as Group })
          }
        >
          <Text className="text-[#0F6BF0]">Chỉnh sửa</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(e) => e.id}
        renderItem={renderExpense}
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View className="px-4 py-6">
            <Text className="text-slate-500">Nhóm chưa có chi tiêu nào.</Text>
          </View>
        }
      />

      {/* Composer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t p-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={goCreateExpense} className="p-3 rounded-full bg-slate-100 mr-3">
            <Text>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={goCreateExpense}
            className="flex-1 rounded-full bg-[#F1F7FF] p-3 items-center"
          >
            <Text className="text-slate-600">Add expense…</Text>
          </TouchableOpacity>
        </View>
      </View>

      <LoadingOverlay visible={loading} text="Đang tải chi tiêu..." />
    </SafeAreaView>
  );
}
