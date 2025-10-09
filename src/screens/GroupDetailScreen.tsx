import React, { useEffect, useMemo } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, SectionList, TouchableOpacity, Text, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppDispatch, RootState } from "../store/store";
import { Expense } from "../store/slices/expensesSlice";
import { fetchExpenses, fetchGroupCategories, Group } from "../store/slices/groupsSlice";
import LoadingOverlay from "../components/LoadingOverlay";
import type { RootStackParamList } from "../../App";
import { SquarePen } from "lucide-react-native";
import { BACKGROUND_COLOR, TEXT_COLOR, CARD_COLOR } from "../commons/constants";

type Props = NativeStackScreenProps<RootStackParamList, "GroupDetail">;

export default function GroupDetailScreen({ navigation, route }: Props) {
  const { groupId } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const groups = useSelector((state: RootState) => state.groups.groups);
  const group = groups.find((g) => g.id === groupId) as Group | undefined;
  const expenses = group?.expenses ?? [];
  const loading = useSelector((state: RootState) => state.groups.loading);

  function toYMDLocal(v: string | Date): string {
    if (!v) return "";
    const d = typeof v === "string" ? new Date(v) : v;
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  const sections = useMemo(() => {
    if (!expenses || expenses.length === 0) return [] as { title: string; data: Expense[] }[];

    // Group by date key, but preserve original order index for stable secondary sort
    const dateToExpenses = new Map<string, { expense: Expense; originalIndex: number }[]>();
    expenses.forEach((expense, originalIndex) => {
      const dateKey = toYMDLocal(expense.spentAt);
      if (!dateToExpenses.has(dateKey)) dateToExpenses.set(dateKey, []);
      dateToExpenses.get(dateKey)!.push({ expense, originalIndex });
    });

    const sectionList = Array.from(dateToExpenses.entries()).map(([title, data]) => ({
      title,
      data: data.map((x) => x.expense),
    }));

    // Sort sections by date desc; YYYY-MM-DD string allows lexicographic sort
    sectionList.sort((a, b) => (a.title < b.title ? 1 : a.title > b.title ? -1 : 0));
    return sectionList;
  }, [expenses]);

  useEffect(() => {
    if (!expenses || expenses.length === 0) {
      dispatch(fetchExpenses(groupId));
    }
    // Fetch categories for the group
    dispatch(fetchGroupCategories(groupId));
  }, [dispatch, groupId, expenses?.length]);


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
        imageUrl: item.imageUrl,
        shareRatios: (item.shareRatios ?? []).map((sr: any) => {
          // Find the user ID by matching username
          const user = group?.users?.find((m: any) => m.name === sr.username);
          return {
            userId: user?.id ?? sr.userId,
            ratio: Number(sr.ratio),
          };
        }),
      },
    });
  }

  function renderExpense({ item, index, section }: { item: Expense; index: number; section: { data: Expense[] } }) {
    const isLastInSection = index === (section?.data?.length ?? 0) - 1;
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate("ExpenseDetail", { expenseId: item.id })}
        onLongPress={() => goEditExpense(item)}
        delayLongPress={300}
        className={`p-3 shadow-sm ${isLastInSection ? "rounded-b-lg mb-2" : ""}`}
        style={{ backgroundColor: CARD_COLOR }}
      >
        <View className="flex-row justify-between">
          <Text className="font-semibold" style={{ color: TEXT_COLOR }}>{item.payer.name}</Text>
          <Text className="font-bold text-slate-400">₫{item.amount.toLocaleString()}</Text>
        </View>
        <Text className="text-slate-400 mt-1">{item.note}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <View className="px-4 py-3 flex-row items-center justify-between">
        <Text className="text-4xl font-bold" style={{ color: TEXT_COLOR }}>{group?.name}</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("GroupForm", { type: "edit", groupData: group as Group })
          }
        >
          <SquarePen color={"#FFFFFF"} />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(e) => e.id}
        renderItem={renderExpense}
        renderSectionHeader={({ section }) => {
          const [y, m, d] = String(section.title).split("-").map((v) => Number(v));
          const date = new Date(y, (m || 1) - 1, d || 1);
          const weekdays = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
          const months = [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12",
          ];
          const weekday = weekdays[date.getDay()];
          const day = String(date.getDate()).padStart(2, "0");
          const monthName = months[date.getMonth()];
          const year = String(date.getFullYear());
          return (
            <View className="px-4 py-2 mt-2 bg-slate-500 rounded-t-lg">
              <Text className="font-semibold" style={{ color: TEXT_COLOR }}>{weekday}</Text>
              <Text className="" style={{ color: TEXT_COLOR }}>{`${day} ${monthName} ${year}`}</Text>
            </View>
          );
        }}
        stickySectionHeadersEnabled
        contentContainerStyle={{ paddingBottom: 80 }}
        ListEmptyComponent={
          <View className="px-4 py-6">
            <Text className="text-slate-400 text-center">Nhóm chưa có chi tiêu nào.</Text>
          </View>
        }
        className="p-4"
      />

      <TouchableOpacity onPress={goCreateExpense} className="absolute right-6 bottom-8 w-14 h-14 bg-[#0F6BF0] rounded-full items-center justify-center shadow-lg">
        <Text className="text-2xl" style={{ color: TEXT_COLOR }}>+</Text>
      </TouchableOpacity>

      <LoadingOverlay visible={loading} />
    </SafeAreaView>
  );
}
