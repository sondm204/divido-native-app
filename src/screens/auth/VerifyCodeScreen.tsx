import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { verifyEmail } from "@/src/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/store/store";

type RootStackParamList = {
    VerifyCode: { email: string };
    Register: { email: string; verificationToken: string };
};

type VerifyCodeRouteProp = RouteProp<RootStackParamList, "VerifyCode">;

export default function VerifyCodeScreen() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<VerifyCodeRouteProp>();
    const { email } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleVerify() {
        if (code.length < 6) {
            alert("Mã phải đủ 6 ký tự");
            return;
        }
        setLoading(true);

        try {
            const response = await dispatch(verifyEmail({ email, code }));
            navigation.navigate("Register", { email, verificationToken: response.payload });
        } catch (err) {
            alert("Mã không đúng hoặc đã hết hạn");
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView className="flex-1 px-6 justify-center bg-white">
            <Text className="text-4xl font-bold mb-4 text-slate-900">
                Nhập mã xác minh
            </Text>
            <Text className="text-base text-slate-600 mb-6">
                Chúng tôi đã gửi mã 6 chữ số đến {email}
            </Text>

            <View className="mb-6">
                <TextInput
                    value={code}
                    onChangeText={setCode}
                    placeholder="Nhập mã 6 số"
                    keyboardType="numeric"
                    maxLength={6}
                    className="border border-slate-300 rounded-xl px-4 py-3 text-center text-xl tracking-[10px] text-slate-800"
                />
            </View>

            <TouchableOpacity
                onPress={handleVerify}
                disabled={loading}
                className={`bg-[#0F6BF0] rounded-full py-4 items-center shadow-md ${loading ? "opacity-50" : ""}`}
            >
                <Text className="text-white text-lg font-semibold">
                    {loading ? "Đang xác minh..." : "Xác minh"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="mt-4"
                onPress={() => console.log("Resend code")}
            >
                <Text className="text-[#0F6BF0] text-center">
                    Gửi lại mã
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
