import React, { useEffect } from "react";
import {
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NavigationProp, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { Expense } from "../store/slices/expensesSlice";
import { fetchBill, fetchExpenses, Group } from "../store/slices/groupsSlice";
import LoadingOverlay from "../components/LoadingOverlay";

// ---- Types ----
type RootStackParamList = {
  GroupDetail: { groupId: string };
  AddExpense: { groupId: string };
  ExpenseDetail: { expenseId: string };
  GroupForm: { type: 'add' | 'edit', groupData: Group };
};


export default function GroupDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "GroupDetail">>();
  const { groupId } = route.params;
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const groups = useSelector((state: RootState) => state.groups.groups);
  const group = groups.find(g => g.id === groupId);
  const expenses = group?.expenses;
  const loading = useSelector((state: RootState) => state.groups.loading);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if((expenses?.length ?? 0) === 0) {
      dispatch(fetchExpenses(groupId));
    }
  }, [groupId]);
  
  function renderExpense({ item }: { item: Expense }) {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('ExpenseDetail', { expenseId: item.id });
        }}
        className="mx-3 my-1 p-3 bg-white rounded-lg shadow-sm"
      >
        <View className="flex-row justify-between">
          <Text className="font-semibold">{item.payer.name}</Text>
          <Text className="font-bold text-slate-900">
            ₫{item.amount.toLocaleString()}
          </Text>
        </View>
        <Text className="text-slate-500 mt-1">{item.note}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <View className="px-4 py-3 flex-row items-center justify-between">
        <Text className="text-lg font-bold">{group?.name}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('GroupForm', { type: 'edit', groupData: (group as Group) })}>
          <Text className="text-[#0F6BF0]">Members</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={expenses}
        keyExtractor={(e) => e.id}
        renderItem={renderExpense}
      />

      {/* Composer */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t p-3">
        <View className="flex-row items-center">
          <TouchableOpacity className="p-3 rounded-full bg-slate-100 mr-3">
            <Text>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AddExpense', { groupId })} className="flex-1 rounded-full bg-[#F1F7FF] p-3 items-center">
            <Text className="text-slate-600">Add expense…</Text>
          </TouchableOpacity>
        </View>
      </View>
      <LoadingOverlay visible={loading} text="Đang tải chi tiêu..." />
    </SafeAreaView>
  );
}
