import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // icon gọn gàng
import { Mixpanel } from "../utils/mixpanel";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { removeToken } from "../utils/utils";
import { RootStackParamList } from "../../App";
import CustomModal from "../components/CustomModal";
import { RootState } from "../store/store";

export default function AccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const dispatch = useDispatch();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const user = useSelector((state: RootState) => state.auth.currentUser);

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

  const confirmLogout = () => {
    setIsLogoutModalVisible(true);
  };

  const menuItems = [
    { icon: "wallet-outline", label: "Ví của tôi", onPress: () => navigation.navigate("Wallet") },
    { icon: "people-outline", label: "Nhóm" },
    { icon: "link-outline", label: "Liên kết ngân hàng" },
    { icon: "calendar-outline", label: "Sự kiện" },
    { icon: "repeat-outline", label: "Giao dịch định kì" },
    { icon: "receipt-outline", label: "Hóa đơn" },
    { icon: "log-out-outline", label: "Đăng xuất", onPress: confirmLogout },
  ];

  useEffect(() => {
    Mixpanel.trackScreenView("Account");
  }, []);



  return (
    <SafeAreaView className="flex-1 bg-black">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 80 }}>
        {/* HEADER */}
        <View className="flex-row justify-between items-center px-4">
          <Text className="text-white text-2xl font-bold">Tài khoản</Text>
          <TouchableOpacity>
            <Ionicons name="help-circle-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>

        {/* USER INFO */}
        <View className="items-center mt-5">
          <View className="w-20 h-20 rounded-full bg-purple-500 items-center justify-center mb-3">
            <Text className="text-white text-3xl font-bold">{user?.name.charAt(0)}</Text>
          </View>
          <View className="bg-gray-700 px-3 py-1 rounded-full mb-2">
            <Text className="text-white text-xs font-semibold">
              TÀI KHOẢN MIỄN PHÍ
            </Text>
          </View>
          <Text className="text-white text-xl font-bold">{user?.name}</Text>
          <Text className="text-gray-300 text-sm">{user?.email}</Text>
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
      <CustomModal
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        onConfirm={(e) => {
          setIsLogoutModalVisible(false);
          handleLogout();
        }}
        confirmText="Đăng xuất"
      >
        <Text style={{ color: '#ffffff', fontSize: 16 }}>
          Bạn có chắc muốn đăng xuất?
        </Text>
      </CustomModal>
    </SafeAreaView>
  );
}
