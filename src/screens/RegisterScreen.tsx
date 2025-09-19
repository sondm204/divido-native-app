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

type RootStackParamList = {
    Login: undefined;
    GroupsList: undefined;
    Register: undefined;
};

export default function RegisterScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    function handleRegister() {
        if (!name || !email || !password || !confirmPassword) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (password !== confirmPassword) {
            alert("Mật khẩu nhập lại không khớp");
            return;
        }
        // TODO: call API hoặc dispatch register action
        console.log("Register with:", name, email, password);

        // Sau khi đăng ký thành công -> quay về Login
        navigation.replace("Login");
    }

    return (
        <SafeAreaView className="flex-1 px-6 justify-center bg-white">
            {/* Title */}
            <Text className="text-4xl font-bold mb-8 text-slate-900">
                Đăng ký
            </Text>

            {/* Name input */}
            <View className="mb-4">
                <Text className="text-sm font-medium text-slate-600 mb-1">
                    Họ và tên
                </Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Nhập họ và tên"
                    className="border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-800"
                />
            </View>

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
            <View className="mb-4">
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

            {/* Confirm password */}
            <View className="mb-6">
                <Text className="text-sm font-medium text-slate-600 mb-1">
                    Nhập lại mật khẩu
                </Text>
                <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Nhập lại mật khẩu"
                    secureTextEntry
                    className="border border-slate-300 rounded-xl px-4 py-3 text-base text-slate-800"
                />
            </View>

            {/* Register button */}
            <TouchableOpacity
                onPress={handleRegister}
                className="bg-[#0F6BF0] rounded-full py-4 items-center shadow-md"
            >
                <Text className="text-white text-lg font-semibold">
                    Đăng ký
                </Text>
            </TouchableOpacity>

            {/* Login link */}
            <View className="flex-row justify-center mt-6">
                <Text className="text-slate-600 text-base">
                    Đã có tài khoản?{" "}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                    <Text className="text-[#0F6BF0] font-medium text-base">
                        Đăng nhập
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}