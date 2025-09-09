import React, { useState } from "react";
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";

export default function AddGroupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  function handleCreate() {
    if (!name.trim()) return;
    // TODO: call API / save group
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 p-4">
      <Text className="text-lg font-bold mb-4">Tạo nhóm mới</Text>

      <Text className="text-sm text-slate-600 mb-2">Tên nhóm</Text>
      <AppInput
        value={name}
        onChangeText={setName}
        placeholder="Ví dụ: Roommates"
      />


      <Text className="text-sm text-slate-600 mb-2">Số lượng người</Text>
      <AppInput
        value={desc}
        onChangeText={setDesc}
        placeholder="Ví dụ: 3"
        editable={false}
      />

      <Text className="text-sm text-slate-600 mb-2">Thành viên</Text>
      <AppInput
        value={desc}
        onChangeText={setDesc}
        placeholder="Ví dụ: 3"
      />

      <Text className="text-sm text-slate-600 mb-2">Ngày tạo</Text>
      <AppInput
        value={new Date().toLocaleDateString("vi-VN")}
        onChangeText={setDesc}
        placeholder="Ví dụ: 3"
        editable={false}
      />

      {/* <TouchableOpacity
        onPress={handleCreate}
        className="bg-[#0F6BF0] py-3 rounded-xl mt-2 items-center"
      >
        <Text className="text-white font-semibold">Tạo nhóm</Text>
      </TouchableOpacity> */}
      <AppButton
        title="Tạo nhóm"
        variant="primary"
        onPress={handleCreate}
      />
    </SafeAreaView>
  );
}
