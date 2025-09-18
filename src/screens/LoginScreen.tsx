import React, { useState } from "react";
import {
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
const navigation = useNavigation<ExpenseDetailScreenNavigationProp>();


type RootStackParamList = {
    Login: undefined;
    GroupsList: undefined;
    Register: undefined;
};

export default function LoginScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleLogin() {
        // TODO: call API hoặc dispatch login action
        console.log("Login with:", email, password);
        navigation.replace("GroupsList"); // Sau khi login thành công -> vào màn GroupsList
    }

    return (
        <SafeAreaView className="flex-1 px-6 justify-center bg-white">
            {/* Title */}
            <Text className="text-4xl font-bold mb-8 text-slate-900">
                Đăng nhập
            </Text>

            {/* Email input */}
            <View className="mb-4">
                <Text className="text-sm font-medium text-slate-600 mb-1">
                    Email
                </Text>
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Nhập email"
                    keyboardType="email-address"
                    className="border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-800"
                />
            </View>

            {/* Password input */}
            <View className="mb-6">
                <Text className="text-sm font-medium text-slate-600 mb-1">
                    Mật khẩu
                </Text>
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Nhập mật khẩu"
                    secureTextEntry
                    className="border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-800"
                />
            </View>

            {/* Login button */}
            <TouchableOpacity
                onPress={handleLogin}
                className="bg-[#0F6BF0] rounded-full py-4 items-center shadow-md"
            >
                <Text className="text-white text-lg font-semibold">
                    Đăng nhập
                </Text>
            </TouchableOpacity>

            {/* Register link */}
            <View className="flex-row justify-center mt-6">
                <Text className="text-slate-600 text-base">
                    Chưa có tài khoản?{" "}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                    <Text className="text-[#0F6BF0] font-medium text-base">
                        Đăng ký
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}