import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  GroupsList: undefined;
  ForgotPassword: undefined;
};

export default function ForgotPasswordScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [email, setEmail] = useState("");

  function handleReset() {
    console.log("Reset password for:", email);
    // TODO: gọi API gửi mail reset password
    navigation.navigate("Login"); // Sau khi reset xong thì quay lại login
  }

  return (
    <SafeAreaView className="flex-1 px-6 justify-center bg-white">
      <Text className="text-3xl font-bold mb-8 text-slate-900">
        Quên mật khẩu
      </Text>

      <View className="mb-6">
        <Text className="text-sm font-medium text-slate-600 mb-1">
          Nhập email của bạn
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          className="border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-800"
        />
      </View>

      <TouchableOpacity
        onPress={handleReset}
        className="bg-[#0F6BF0] rounded-full py-4 items-center shadow-md"
      >
        <Text className="text-white text-lg font-semibold">
          Gửi liên kết đặt lại
        </Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text className="text-[#0F6BF0] font-medium text-base">
            Quay lại đăng nhập
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
