import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AppButton from "../components/AppButton";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const questions = [
    {
        id: "age",
        question: "Bạn thuộc nhóm độ tuổi nào?",
        options: ["< 18", "18 – 25", "26 – 35", "36 – 45", "> 45"],
    },
    {
        id: "job",
        question: "Nghề nghiệp của bạn là gì?",
        options: [
            "Học sinh / Sinh viên",
            "Nhân viên văn phòng",
            "Lao động tự do",
            "Kinh doanh / Chủ doanh nghiệp",
            "Khác",
        ],
    },
    {
        id: "income",
        question: "Thu nhập trung bình hàng tháng của bạn?",
        options: ["< 5 triệu", "5 – 10 triệu", "10 – 20 triệu", "> 20 triệu"],
    },
    {
        id: "spendingRate",
        question: "Bạn mong muốn chi tiêu bao nhiêu % thu nhập mỗi tháng?",
        options: ["< 50%", "50 – 70%", "70 – 90%", "> 90%"],
    },
    {
        id: "foodSpendingRate",
        question: "Bạn mong muốn dùng bao nhiêu phần trăm chi tiêu cho ăn uống?",
        options: ["< 30%", "30 – 50%", "50 – 70%", "> 70%"],
    },
    {
        id: "transportSpendingRate",
        question: "Bạn mong muốn dùng bao nhiêu phần trăm chi tiêu cho di chuyển?",
        options: ["< 10%", "10 – 20%", "20 – 30%", "> 30%"],
    },
    {
        id: "entertainmentSpendingRate",
        question: "Bạn mong muốn dùng bao nhiêu phần trăm chi tiêu cho giải trí?",
        options: ["< 10%", "10 – 20%", "20 – 30%", "> 30%"],
    },
    {
        id: "otherSpendingRate",
        question: "Bạn mong muốn dùng bao nhiêu phần trăm chi tiêu cho các nhu cầu khác?",
        options: ["< 10%", "10 – 20%", "20 – 30%", "> 30%"],
    },
    {
        id: "goal",
        question: "Mục tiêu tài chính chính của bạn?",
        options: [
            "Tiết kiệm dài hạn",
            "Chi tiêu hợp lý hàng tháng",
            "Đầu tư",
            "Theo dõi nợ / trả nợ",
        ],
    },
];

type RootStackParamList = {
    MainScreen: undefined;
};

export default function SurveyScreen() {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [current, setCurrent] = useState(0);
    const [completed, setCompleted] = useState(false);
    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const handleSelect = (option: string) => {
        setAnswers({ ...answers, [questions[current].id]: option });
    };

    const handleNext = () => {
        if (current < questions.length - 1) {
            setCurrent(current + 1);
        } else {
            console.log("Survey completed:", answers);
            setCompleted(true);
            // TODO: Gửi dữ liệu lên server nếu cần
        }
    };

    const handleBack = () => {
        if (current > 0) setCurrent(current - 1);
    };

    const progressPercent = useMemo(() => {
        return ((current + 1) / questions.length) * 100;
    }, [current]);

    if (completed) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
                <Text className="text-2xl font-bold text-center text-gray-800 mb-4">
                    🎉 Cảm ơn bạn đã tham gia khảo sát!
                </Text>
                <Text className="text-base text-gray-600 text-center mb-6">
                    Hãy bắt đầu hành trình quản lý chi tiêu của bản thân ngay bây giờ.
                </Text>

                <AppButton
                    className="w-full"
                    title="Bắt đầu ngay"
                    variant="primary"
                    onPress={() => navigation.navigate("MainScreen")}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white relative">
            {/* Top sticky progress bar */}
            <View
                pointerEvents="none"
                className="z-10 absolute top-0 left-0 right-0"
            >
                <View className="h-2 bg-gray-200 w-full">
                    <View
                        className="h-2 bg-blue-600"
                        style={{ width: `${progressPercent}%` }}
                    />
                </View>
            </View>

            <View className="flex-1 p-5">
                {/* Header */}
                <View className="mb-4">
                    <Text className="text-2xl font-extrabold text-gray-900">
                        Khảo sát nhanh
                    </Text>
                    <Text className="text-gray-500 mt-1">
                        Bước {current + 1} / {questions.length}
                    </Text>
                </View>


                {/* Step dots */}
                <View className="flex-row items-center justify-center mb-4">
                    {questions.map((_, index) => {
                        const isActive = index === current;
                        const isDone = index < current;
                        return (
                            <View
                                key={index}
                                className={`h-2 rounded-full mx-1 ${isActive ? "bg-blue-600 w-6" : isDone ? "bg-blue-300 w-4" : "bg-gray-300 w-2"
                                    }`}
                            />
                        );
                    })}
                </View>

                <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 16 }}>
                    <Text className="text-xl font-bold mb-4 text-gray-900">
                        {questions[current].question}
                    </Text>

                    {questions[current].options.map((option) => {
                        const selected = answers[questions[current].id as keyof typeof answers] === option;
                        return (
                            <TouchableOpacity
                                key={option}
                                activeOpacity={0.9}
                                className={`mb-3 rounded-2xl border px-4 py-3 flex-row items-center justify-between ${selected
                                    ? "bg-blue-50 border-blue-500"
                                    : "bg-gray-50 border-gray-200"
                                    }`}
                                onPress={() => handleSelect(option)}
                            >
                                <View className="flex-row items-center">
                                    <Text
                                        className={`text-base ${selected ? "text-blue-700 font-semibold" : "text-gray-800"
                                            }`}
                                    >
                                        {option}
                                    </Text>
                                </View>
                                {selected ? (
                                    <Text className="text-blue-600 text-lg">✓</Text>
                                ) : (
                                    <Text className="text-gray-400 text-lg">›</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Actions */}
                <View className="mt-2 flex-row">
                    <View className="flex-1 mr-2">
                        <AppButton
                            title="Quay lại"
                            variant="secondary"
                            onPress={handleBack}
                            disabled={current === 0}
                        />
                    </View>
                    <View className="flex-1 ml-2">
                        <AppButton
                            onPress={handleNext}
                            disabled={!answers[questions[current].id as keyof typeof answers]}
                            title={current === questions.length - 1 ? "Hoàn tất" : "Tiếp tục"}
                            variant="primary"
                        />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
