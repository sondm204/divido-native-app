import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BACKGROUND_COLOR, TEXT_COLOR } from "../commons/constants";
import { Bell, BusFront, Hamburger, HeartPulse } from "lucide-react-native";
import { AppSectionCard } from "../components/AppSectionCard";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { LineChart } from "react-native-gifted-charts"
import { Mixpanel } from "../utils/mixpanel";
import { useEffect } from "react";
import { fetchGroups } from "../store/slices/groupsSlice";
import { fetchTotalAmount } from "../store/slices/authSlice";


export const HomeScreen = () => {

    const groups = useSelector((state: RootState) => state.groups.groups);
    const dispatch = useDispatch<AppDispatch>();
    const currentUser = useSelector((state: RootState) => state.auth.currentUser);

    useEffect(() => {
        dispatch(fetchGroups());
        dispatch(fetchTotalAmount({}));
    }, []);

    const thisMonth = [
        { value: 0, label: '01/10' },
        { value: 500000 },
        { value: 1000000 },
        { value: 1800000 },
        { value: 2000000 },
        { value: 2200000 },
        { value: 3500000, label: '31/10' },
    ];

    const avg3Months = [
        { value: 0 },
        { value: 600000 },
        { value: 1200000 },
        { value: 1600000 },
        { value: 2300000 },
        { value: 2700000 },
        { value: 2900000, },
    ];

    useEffect(() => {
        Mixpanel.trackScreenView("Home");
    }, []);

    return (
        <SafeAreaView style={{ backgroundColor: BACKGROUND_COLOR, flex: 1 }}>
            <ScrollView className="flex-1 px-4" contentContainerStyle={{ gap: 16, paddingBottom: 100 }}>
                <View className="flex-row justify-between items-start">
                    <View className="flex gap-2">
                        <Text className="text-3xl font-bold" style={{ color: TEXT_COLOR }}>{currentUser?.totalAmount?.toLocaleString('vi-VN')} đ</Text>
                        <Text className="text-md text-gray-500">Tổng chi tiêu</Text>
                    </View>
                    <View className="mt-2">
                        <Bell size={24} color={TEXT_COLOR} />
                    </View>
                </View>
                <AppSectionCard>
                    <Text className="text-lg font-semibold mb-4" style={{ color: TEXT_COLOR }}>Tổng chi tiêu</Text>
                    <View className="flex gap-4 border-t border-gray-700 pt-4">
                        {groups.map((group) => (
                            <View key={group.id} className="flex-row justify-between items-center">
                                <View className="flex-row gap-2 items-center">
                                    <View className="w-12 h-12 rounded-full bg-slate-200 mr-3 items-center justify-center">
                                        <Text className="text-lg font-semibold text-slate-700">
                                            {group.name
                                                ?.split(" ")
                                                ?.map((s) => s[0])
                                                ?.slice(0, 2)
                                                ?.join("") || "??"}
                                        </Text>
                                    </View>
                                    <Text className="text-lg font-semibold" style={{ color: TEXT_COLOR }}>{group.name}</Text>
                                </View>
                                <View className="flex gap-2 items-end">
                                    <Text className="text-lg font-semibold" style={{ color: TEXT_COLOR }}>{group.totalUserAmount?.toLocaleString('vi-VN')} đ</Text>
                                    <Text className="text-sm text-gray-500" >Tổng: {group.totalAmount?.toLocaleString('vi-VN')} đ</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                </AppSectionCard>
                <AppSectionCard>
                    <Text className="text-lg font-semibold mb-4" style={{ color: TEXT_COLOR }}>Thống kê tháng này</Text>
                    <View style={{ backgroundColor: 'transparent' }}>
                        <LineChart
                            areaChart
                            curved
                            data={thisMonth}
                            data2={avg3Months}
                            noOfSections={5}
                            height={200}
                            spacing={40}
                            thickness={3}
                            color1="#ff4d4f"
                            color2="#888888"
                            startFillColor1="#ff4d4f"
                            endFillColor1="rgba(255,77,79,0.1)"
                            startOpacity={0.4}
                            endOpacity={0}
                            yAxisColor="gray"
                            xAxisColor="gray"
                            hideRules={false}
                            rulesColor="#444"
                            yAxisTextStyle={{ color: '#aaa' }}
                            xAxisLabelTextStyle={{ color: '#aaa' }}
                            showVerticalLines
                            verticalLinesColor="#333"
                            hideDataPoints
                            pointerConfig={{
                                pointerStripHeight: 250,
                                pointerStripColor: 'gray',
                                pointerColor: '#FFFFFF',
                                radius: 5,
                                showPointerStrip: true,
                                pointerLabelWidth: 120,
                                pointerLabelComponent: (items: any) => {
                                    const item = items[0];
                                    return (
                                        <View
                                            style={{
                                                backgroundColor: '#333',
                                                paddingVertical: 8,
                                                paddingHorizontal: 12,
                                                borderRadius: 8,
                                                minWidth: 120,
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                                                {item.value.toLocaleString('vi-VN')} ₫
                                            </Text>
                                        </View>
                                    );
                                },
                            }}
                        />
                    </View>
                </AppSectionCard>
                <AppSectionCard>
                    <Text className="text-lg font-semibold mb-4" style={{ color: TEXT_COLOR }}>Chi tiêu nhiều nhất</Text>
                    <View className="flex gap-4 border-t border-gray-700 pt-4">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row gap-2 items-center">
                                <View className="w-12 h-12 rounded-full bg-slate-600 mr-3 items-center justify-center">
                                    <HeartPulse size={24} color={TEXT_COLOR} />
                                </View>
                                <View className="flex">
                                    <Text className="text-lg font-semibold" style={{ color: TEXT_COLOR }}>Sức khỏe</Text>
                                    <Text className="text-sm text-gray-500">569,000 đ</Text>
                                </View>
                            </View>
                            <Text className="text-lg font-semibold" style={{ color: 'red' }}>48%</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row gap-2 items-center">
                                <View className="w-12 h-12 rounded-full bg-slate-600 mr-3 items-center justify-center">
                                    <Hamburger size={24} color={TEXT_COLOR} />
                                </View>
                                <View className="flex">
                                    <Text className="text-lg font-semibold" style={{ color: TEXT_COLOR }}>Ăn uống</Text>
                                    <Text className="text-sm text-gray-500">462,000 đ</Text>
                                </View>
                            </View>
                            <Text className="text-lg font-semibold" style={{ color: 'red' }}>39%</Text>
                        </View>
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row gap-2 items-center">
                                <View className="w-12 h-12 rounded-full bg-slate-600 mr-3 items-center justify-center">
                                    <BusFront size={24} color={TEXT_COLOR} />
                                </View>
                                <View className="flex">
                                    <Text className="text-lg font-semibold" style={{ color: TEXT_COLOR }}>Di chuyển</Text>
                                    <Text className="text-sm text-gray-500">130,000 đ</Text>
                                </View>
                            </View>
                            <Text className="text-lg font-semibold" style={{ color: 'red' }}>11%</Text>
                        </View>
                    </View>
                </AppSectionCard>
            </ScrollView>
        </SafeAreaView>
    );
};