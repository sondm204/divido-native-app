import React, { useState } from "react";
    import { SafeAreaView, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";
import { Group } from "../store/slices/groupsSlice";
 
type GroupFormRouteProp = RouteProp<RootStackParamList, "GroupForm">;

export default function GroupFormScreen() {
  const route = useRoute<GroupFormRouteProp>();
  const { type, groupData } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [formData, setFormData] = useState<Group>(
    groupData ?? { id: "", name: "", users: [], createdAt: new Date().toISOString() }
  );

  function handleCreate() {
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 p-4">
      <Text className="text-lg font-bold mb-4">Tạo nhóm mới</Text>

      <Text className="text-sm text-slate-600 mb-2">Tên nhóm</Text>
      <AppInput
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        placeholder="Ví dụ: Roommates"
      />


      <Text className="text-sm text-slate-600 mb-2">Số lượng người</Text>
      <AppInput
        value={formData.users?.length?.toString() || '0'}
        editable={false}
      />

      <Text className="text-sm text-slate-600 mb-2">Thành viên</Text>
      <AppInput
        value={formData.users?.map((user) => user.name).join(', ') || ''}
        placeholder="Ví dụ: 3"
      />

      <Text className="text-sm text-slate-600 mb-2">Ngày tạo</Text>
      <AppInput
        value={formData.createdAt ? new Date(formData.createdAt).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN")}
        editable={false}
      />
      <AppButton
        title="Tạo nhóm"
        variant="primary"
        onPress={handleCreate}
      />
    </SafeAreaView>
  );
}
