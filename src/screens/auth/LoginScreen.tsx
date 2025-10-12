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
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/slices/authSlice";
import { AppDispatch, RootState } from "../../store/store";
import { Mixpanel } from "../../utils/mixpanel";

type RootStackParamList = {
    Login: undefined;
    MainScreen: undefined;
    GroupsList: undefined;
    Email: undefined;
    ForgotPassword: undefined;
    SurveyScreen: undefined;
};

export default function LoginScreen() {
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const dispatch = useDispatch<AppDispatch>();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    async function handleLogin() {
        try {
            Mixpanel.track("Click Login Button", {});
            const resultAction = await dispatch(login({ email, password }));

            if (login.fulfilled.match(resultAction)) {
                // Login thành công
                Mixpanel.track("Login Success", {});
                navigation.replace("MainScreen");
                // navigation.navigate("SurveyScreen");
            } else {
                // Login thất bại, có thể lấy lỗi
                const errorMsg = resultAction.payload || "Login failed MESS";
                Mixpanel.track("Login Failure", { reason: String(errorMsg) });
                alert(errorMsg);
            }
        } catch (err) {
            Mixpanel.track("Login Failure", { reason: err instanceof Error ? err.message : String(err) });
            console.log(err);
        }
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
            <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
                className="mb-6 self-end"
            >
                <Text className="text-[#0F6BF0] text-sm font-medium">
                    Quên mật khẩu?
                </Text>
            </TouchableOpacity>
            {/* Login button */}
            <TouchableOpacity
                onPress={handleLogin}
                className="bg-[#0F6BF0] rounded-full py-4 items-center shadow-md active:bg-blue-600"
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
                <TouchableOpacity onPress={() => navigation.navigate("Email")}>
                    <Text className="text-[#0F6BF0] font-medium text-base">
                        Đăng ký
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}