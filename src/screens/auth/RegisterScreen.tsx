import React, { useState } from "react";
import {
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";
import { register } from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store/store";

type RootStackParamList = {
    Login: undefined;
    GroupsList: undefined;
    Register: { email: string; verificationToken: string };
};

type RegisterRouteProp = RouteProp<RootStackParamList, "Register">;

export default function RegisterScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<RegisterRouteProp>();
    const { email, verificationToken } = route.params;
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const dispatch = useDispatch<AppDispatch>();

    async function handleRegister() {
        if (!name || !password || !confirmPassword) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (password !== confirmPassword) {
            alert("Mật khẩu nhập lại không khớp");
            return;
        }
        try {
            await dispatch(register({ name, email, password, verificationToken }));
            navigation.replace("Login");
        } catch (error) {
            console.log(error);
        }
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