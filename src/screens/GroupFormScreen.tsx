import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { RootStackParamList } from "../../App";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";
import { Group, createGroup, fetchGroups } from "../store/slices/groupsSlice";
import { User } from "../store/slices/userSlice";
import { getUserByEmail } from "../store/slices/userSlice";

type GroupFormRouteProp = RouteProp<RootStackParamList, "GroupForm">;

export default function GroupFormScreen() {
  const route = useRoute<GroupFormRouteProp>();
  const { type, groupData } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<Group>(
    groupData ?? { id: "", name: "", users: [], createdAt: new Date().toISOString() }
  );
  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const [searchUser, setSearchUser] = useState<User>();
  const [searchEmail, setSearchEmail] = useState<string>('');

  function checkEmailSuffix(text: string) {
    const regex = /@(gmail\.com|yahoo\.com|outlook\.com)$/;
    return regex.test(text);
  }
  const handleSearchUser = async (e: string) => {
    const email = e.toLowerCase();
    setSearchEmail(email);

    if (email && checkEmailSuffix(email)) {
      const user = await getUserByEmail({ email });
      if (user) {
        setSearchUser(user);
        setIsOpenDropDown(true);
      } else {
        setIsOpenDropDown(false);
      }
    } else {
      setIsOpenDropDown(false);
    }

  };

  const handleChooseUser = () => {
    if (searchUser) {
      setIsOpenDropDown(false);
      setSearchEmail('');
      if (formData.users?.find((user) => user.id === searchUser.id)) {
        return;
      }
      setFormData({ ...formData, users: [...formData.users || [], searchUser] });
    }
  }

  const removeChooseUser = (userId: string) => {
    setFormData({ ...formData, users: formData.users?.filter((user) => user.id !== userId) });
  }

  async function handleCreate() {
    if (type === 'add') {
      // Validate that name is not empty
      if (!formData.name.trim()) {
        alert('Vui lòng nhập tên nhóm');
        return;
      }
      
      try {
        await dispatch(createGroup({
          name: formData.name.trim(),
          users: formData.users,
          createdAt: formData.createdAt
        })).unwrap();
        
        // Refetch groups to ensure we have the latest data
        dispatch(fetchGroups());
      } catch (error) {
        console.error('Failed to create group:', error);
        alert('Không thể tạo nhóm. Vui lòng thử lại.');
        return;
      }
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 p-4">
      <Text className="text-lg font-bold mb-4">Tạo nhóm mới</Text>
      <View className="mb-4">
        <Text className="text-sm text-slate-600 mb-2">Tên nhóm</Text>
        <AppInput
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Ví dụ: Roommates"
        />
      </View>


      <View className="mb-4">
        <Text className="text-sm text-slate-600 mb-2">Số lượng người</Text>
        <AppInput
          value={formData.users?.length?.toString() || '0'}
          editable={false}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm text-slate-600 mb-2">Thành viên</Text>
        <View className="flex flex-col border border-slate-300 rounded-lg px-2 gap-2">
          <View className="flex-row gap-2 p-2 overflow-x-auto">
            {formData.users?.map((user) => (
              <Text key={user.id} onPress={() => removeChooseUser(user.id)} className="bg-blue-500 text-white rounded-full py-1 px-4 active:bg-red-500">{user.name}</Text>
            ))}
          </View>
          <AppInput
            placeholder="Tìm kiếm..."
            onChangeText={(text) => handleSearchUser(text)}
            value={searchEmail}
          />
          {isOpenDropDown && (
            <TouchableOpacity
              onPress={handleChooseUser}
              className="border border-slate-300 rounded-lg p-2 mb-2">
              <View className="flex flex-row gap-2 w-full">
                <View className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Text className="text-white text-center">{searchUser?.name?.split(' ')[0]?.slice(0, 1)?.toUpperCase() || '?'}</Text>
                </View>
                <View className="flex-1 flex flex-col gap-1">
                  <Text className="text-sm font-bold">{searchUser?.name}</Text>
                  <Text className="text-xs text-slate-500">{searchUser?.email}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm text-slate-600 mb-2">Ngày tạo</Text>
        <AppInput
          value={formData.createdAt ? new Date(formData.createdAt).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN")}
          editable={false}
        />
      </View>
      <AppButton
        title="Tạo nhóm"
        variant="primary"
        onPress={handleCreate}
      />
    </SafeAreaView>
  );
}
