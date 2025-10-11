import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; // icon gọn gàng

export default function AccountScreen() {
  const menuItems = [
    { icon: "wallet-outline", label: "Ví của tôi" },
    { icon: "people-outline", label: "Nhóm" },
    { icon: "link-outline", label: "Liên kết ngân hàng" },
    { icon: "calendar-outline", label: "Sự kiện" },
    { icon: "repeat-outline", label: "Giao dịch định kì" },
    { icon: "receipt-outline", label: "Hóa đơn" },
    { icon: "log-out-outline", label: "Đăng xuất" },
  ];

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

      {/* BOTTOM TAB BAR */}
      <View className="flex-row justify-between items-center bg-black border-t border-gray-800 px-4 py-2">
        <TabItem icon="home-outline" label="Tổng quan" />
        <TabItem icon="wallet-outline" label="Sổ giao dịch" />
        <TouchableOpacity className="bg-green-500 p-3 rounded-full -mt-8 shadow-lg">
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
        <TabItem icon="briefcase-outline" label="Ngân sách" />
        <TabItem icon="person-outline" label="Tài khoản" active />
      </View>
    </SafeAreaView>
  );
}

const TabItem = ({
  icon,
  label,
  active,
}: {
  icon: string;
  label: string;
  active?: boolean;
}) => (
  <TouchableOpacity className="items-center flex-1">
    <Ionicons
      name={icon as any}
      size={22}
      color={active ? "#22c55e" : "#aaa"}
    />
    <Text
      className={`text-xs mt-1 ${
        active ? "text-green-500 font-semibold" : "text-gray-400"
      }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);
