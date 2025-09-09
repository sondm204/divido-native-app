import React, { useState } from "react";
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

type AddExpenseRouteProp = RouteProp<RootStackParamList, "AddExpense">;

export default function AddExpenseScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<AddExpenseRouteProp>();
  const { groupId } = route.params;

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [payer, setPayer] = useState("");

  function handleSave() {
    if (!amount.trim() || !payer.trim()) return;
    // TODO: save expense to group
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 p-4">
      <Text className="text-lg font-bold mb-4">Thêm chi tiêu</Text>

      <Text className="text-sm text-slate-600 mb-2">Số tiền</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="₫0"
        className="bg-white rounded-xl border border-slate-200 p-3 mb-4"
      />

      <Text className="text-sm text-slate-600 mb-2">Mô tả</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Ví dụ: Bữa tối, taxi..."
        className="bg-white rounded-xl border border-slate-200 p-3 mb-4"
      />

      <Text className="text-sm text-slate-600 mb-2">Người trả</Text>
      <TextInput
        value={payer}
        onChangeText={setPayer}
        placeholder="Tên thành viên"
        className="bg-white rounded-xl border border-slate-200 p-3 mb-4"
      />

      {/* Gợi ý: sau này có thể thay bằng dropdown chọn thành viên */}

      <TouchableOpacity
        onPress={handleSave}
        className="bg-[#0F6BF0] py-3 rounded-xl mt-2 items-center"
      >
        <Text className="text-white font-semibold">Lưu chi tiêu</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
