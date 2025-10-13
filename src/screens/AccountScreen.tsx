import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // icon gọn gàng
import { Mixpanel } from "../utils/mixpanel";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { removeToken } from "../utils/utils";
import { RootStackParamList } from "../../App";

export default function AccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await removeToken();
      dispatch(logout());
      Mixpanel.track("Logout", {})
      navigation.replace("Login");
    } catch (error) {
      console.error("Error during logout:", error);
      dispatch(logout());
      navigation.replace("Login");
    }
  };

  const menuItems = [
    { icon: "wallet-outline", label: "Ví của tôi" },
    { icon: "people-outline", label: "Nhóm" },
    { icon: "link-outline", label: "Liên kết ngân hàng" },
    { icon: "calendar-outline", label: "Sự kiện" },
    { icon: "repeat-outline", label: "Giao dịch định kì" },
    { icon: "receipt-outline", label: "Hóa đơn" },
    { icon: "log-out-outline", label: "Đăng xuất", onPress: handleLogout },
  ];

  useEffect(() => {
    Mixpanel.trackScreenView("Account");
  }, []);

  

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* HEADER */}
      <View className="flex-row justify-between items-center px-4 pt-2">
        <Text className="text-white text-lg font-bold">Tài khoản</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
        {/* USER INFO */}
        <View className="items-center mt-5">
          <View className="w-20 h-20 rounded-full bg-purple-500 items-center justify-center mb-3">
            <Text className="text-white text-3xl font-bold">D</Text>
          </View>
          <View className="bg-gray-700 px-3 py-1 rounded-full mb-2">
            <Text className="text-white text-xs font-semibold">
              TÀI KHOẢN MIỄN PHÍ
            </Text>
          </View>
          <Text className="text-white text-lg font-bold">Duongminhson16012004</Text>
          <Text className="text-gray-300 text-sm">duongminhson16012004@gmail.com</Text>
          <View className="mt-1 flex-row items-center justify-center">
            <Ionicons name="logo-google" size={18} color="white" />
          </View>
        </View>

        {/* BANNER */}
        <View className="mx-5 mt-6 rounded-xl overflow-hidden bg-blue-600">
          <View className="p-4 flex-row justify-between items-center">
            <View>
              <Text className="text-yellow-300 text-3xl font-extrabold">-80%</Text>
              <Text className="text-white text-sm mt-1">
                Khai thác tối đa Premium
              </Text>
            </View>
            <TouchableOpacity className="bg-yellow-400 px-3 py-2 rounded-full">
              <Text className="font-bold text-black">Nâng cấp ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MENU ITEMS */}
        <View className="mt-8">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              className="flex-row items-center justify-between px-5 py-4 border-b border-gray-800"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center">
                <Ionicons name={item.icon as any} size={22} color="white" />
                <Text className="text-white text-base ml-4">{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
