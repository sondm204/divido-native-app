import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { RootStackParamList } from "../../App";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";
import { Group, createGroup, fetchGroups, updateGroup, createCategory, deleteCategory } from "../store/slices/groupsSlice";
import { User } from "../store/slices/userSlice";
import { getUserByEmail } from "../store/slices/userSlice";
import { Category } from "../store/slices/expensesSlice";
import { SafeAreaView } from "react-native-safe-area-context";

type GroupFormRouteProp = RouteProp<RootStackParamList, "GroupForm">;

export default function GroupFormScreen() {
  const route = useRoute<GroupFormRouteProp>();
  const { type, groupData } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch<AppDispatch>();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const [formData, setFormData] = useState<Group>(
    groupData ? {
      ...groupData,
      categories: groupData.categories || [],
      createdAt: groupData.createdAt || new Date().toISOString()
    } : {
      id: "",
      name: "",
      users: currentUser ? [currentUser] : [],
      createdAt: new Date().toISOString()
    }
  );
  const [isOpenDropDown, setIsOpenDropDown] = useState(false);
  const [searchUser, setSearchUser] = useState<User>();
  const [searchEmail, setSearchEmail] = useState<string>('');
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');

  // Ensure current user is always included in new groups
  useEffect(() => {
    if (type === 'add' && currentUser && formData.users) {
      const hasCurrentUser = formData.users.some(user => user.id === currentUser.id);
      if (!hasCurrentUser) {
        setFormData(prev => ({
          ...prev,
          users: [currentUser, ...(prev.users || [])]
        }));
      }
    }
  }, [currentUser, type]);

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
    // Prevent removing the current user
    if (currentUser && userId === currentUser.id) {
      return;
    }
    setFormData({ ...formData, users: formData.users?.filter((user) => user.id !== userId) });
  }

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: Category = {
        id: Date.now().toString(), // Temporary ID for local state
        name: newCategoryName.trim()
      };
      const updatedFormData = {
        ...formData,
        categories: [...(formData.categories || []), newCategory]
      };
      setFormData(updatedFormData);
      setNewCategoryName('');
      setIsCategoryFormOpen(false);
    }
  }

  const handleRemoveCategory = (categoryId: string) => {
    const updatedFormData = {
      ...formData,
      categories: formData.categories?.filter((category) => category.id !== categoryId)
    };
    setFormData(updatedFormData);
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
    } else {
      try {
        await dispatch(updateGroup({
          id: formData.id,
          name: formData.name.trim(),
          users: formData.users,
          categories: formData.categories,
          createdAt: formData.createdAt
        })).unwrap();
        dispatch(fetchGroups());
      } catch (error) {
        console.error('Failed to update group:', error);
        alert('Không thể cập nhật nhóm. Vui lòng thử lại.');
        return;
      }
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 p-4">
      <Text className="text-4xl font-bold mb-4 text-white text-center">{type === 'add' ? 'Tạo nhóm mới' : 'Chỉnh sửa nhóm'}</Text>
      <View className="mb-4">
        <Text className="text-sm mb-2 text-white">Tên nhóm</Text>
        <AppInput
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Ví dụ: Roommates"
        />
      </View>


      <View className="mb-4">
        <Text className="text-sm text-white mb-2">Số lượng người</Text>
        <AppInput
          value={formData.users?.length?.toString() || '0'}
          editable={false}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm text-white mb-2">Thành viên</Text>
        <View className="flex flex-col border border-slate-500 rounded-lg p-2 gap-2">
          <View className="flex-row gap-2 p-2 overflow-x-auto">
            {formData.users?.map((user) => {
              const isCurrentUser = currentUser && user.id === currentUser.id;
              return (
                <Text 
                  key={user.id || `${user.email || user.name}-${user.name}`}
                  onPress={() => !isCurrentUser && removeChooseUser(user.id)}
                  className={`rounded-full py-1 px-4 ${
                    isCurrentUser 
                      ? "bg-gray-400 text-white" 
                      : "bg-blue-500 text-white active:bg-red-500"
                  }`}
                >
                  {user.name} {isCurrentUser ? "(Bạn)" : ""}
                </Text>
              );
            })}
          </View>
          <AppInput
            placeholder="Tìm kiếm..."
            onChangeText={(text) => handleSearchUser(text)}
            value={searchEmail}
          />
          {isOpenDropDown && (
            <TouchableOpacity
              onPress={handleChooseUser}
              className="border border-slate-500 rounded-lg p-2 mb-2">
              <View className="flex flex-row gap-2 w-full">
                <View className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Text className="text-white text-center">{searchUser?.name?.split(' ')[0]?.slice(0, 1)?.toUpperCase() || '?'}</Text>
                </View>
                <View className="flex-1 flex flex-col gap-1">
                  <Text className="text-sm font-bold text-white">{searchUser?.name}</Text>
                  <Text className="text-xs text-slate-400">{searchUser?.email}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {type === 'edit' && (
        <View className="mb-4">
          <Text className="text-sm text-white mb-2">Danh mục</Text>
        <View className="flex flex-col border border-slate-500 rounded-lg p-2 gap-2">
          <ScrollView className="p-2" horizontal showsHorizontalScrollIndicator={false}>
            {formData.categories?.map((category) => (
              <Text key={category.id}
                onPress={() => handleRemoveCategory(category.id)}
                className="bg-green-500 mx-[2px] text-white rounded-full py-1 px-4 active:bg-red-500">{category.name}</Text>
            ))}
            </ScrollView>
          {!isCategoryFormOpen ? (
            <TouchableOpacity
              onPress={() => setIsCategoryFormOpen(true)}
              className="border border-slate-500 rounded-lg p-2 mb-2 bg-blue-50">
              <Text className="text-blue-600 text-center font-medium">+ Thêm danh mục</Text>
            </TouchableOpacity>
          ) : (
            <View className="border border-slate-500 rounded-lg p-2 mb-2">
              <AppInput
                placeholder="Tên danh mục..."
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <View className="flex-row gap-2 mt-2">
                <TouchableOpacity
                  onPress={handleAddCategory}
                  className="flex-1 bg-green-500 rounded-lg py-2">
                  <Text className="text-white text-center font-medium">Thêm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setIsCategoryFormOpen(false);
                    setNewCategoryName('');
                  }}
                  className="flex-1 bg-gray-500 rounded-lg py-2">
                  <Text className="text-white text-center font-medium">Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        </View>
      )}

      <View className="mb-4">
        <Text className="text-sm text-white mb-2">Ngày tạo</Text>
        <AppInput
          value={formData.createdAt ? new Date(formData.createdAt).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN")}
          editable={false}
        />
      </View>
      <AppButton
        title={type === 'add' ? 'Tạo nhóm' : 'Cập nhật'}
        variant="primary"
        onPress={handleCreate}
      />
    </SafeAreaView>
  );
}
