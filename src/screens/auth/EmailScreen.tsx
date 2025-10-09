import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { emailVerification } from "../../store/slices/authSlice";

type RootStackParamList = {
    VerifyCode: { email: string };
};

export default function EmailScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    async function handleSendCode() {
        if (!email) {
            alert("Vui lòng nhập email");
            return;
        }
        if (!email.includes("@")) {
            alert("Email không hợp lệ");
            return;
        }
        setLoading(true);

        try {
            await dispatch(emailVerification({ email })).unwrap();
            navigation.navigate("VerifyCode", { email });
        } catch (err) {
            alert("Gửi mã thất bại, vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 px-6 justify-center bg-white">
            <Text className="text-4xl font-bold mb-8 text-slate-900">
                Xác minh Email
            </Text>

            <View className="mb-6">
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

            <TouchableOpacity
                onPress={handleSendCode}
                disabled={loading}
                className={`bg-[#0F6BF0] rounded-full py-4 items-center shadow-md ${loading ? "opacity-50" : ""}`}
            >
                <Text className="text-white text-lg font-semibold">
                    {loading ? "Đang gửi..." : "Gửi mã xác minh"}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
