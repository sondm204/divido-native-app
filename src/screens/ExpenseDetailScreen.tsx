import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";
import type { Expense, Bill } from "../store/slices/expensesSlice"; // file chứa các interface của bạn
import { RootStackParamList } from "../../App";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { fetchBill } from "../store/slices/groupsSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";

type ExpenseDetailRouteProp = RouteProp<RootStackParamList, "ExpenseDetail">;

export default function ExpenseDetailScreen() {
    const route = useRoute<ExpenseDetailRouteProp>();
    const { expenseId } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const expense = useSelector((state: RootState) => state.groups.currentGroup?.expenses?.find(expense => expense.id === expenseId));


    useEffect(() => {
        if(expense?.bills?.length === 0) {
            dispatch(fetchBill(expenseId));
        }
    }, [expenseId]);

    function formatCurrency(value: number) {
        return value.toLocaleString("vi-VN") + "đ";
    }

    const renderBillItem = ({ item }: { item: Bill }) => (
        <View className="flex-row items-center px-3 py-2 border-b border-slate-100">
            <Text className="flex-1">{item.name}</Text>
            <Text className="w-12 text-center">{item.quantity}</Text>
            <Text className="w-20 text-right">{formatCurrency(item.unitPrice)}</Text>
            <Text className="w-24 text-right">{formatCurrency(item.totalPrice)}</Text>
            <TouchableOpacity className="ml-2">
                <Pencil size={16} color="#0F6BF0" />
            </TouchableOpacity>
            <TouchableOpacity className="ml-2">
                <Trash2 size={16} color="red" />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 p-4">
            <Text className="text-lg font-bold mb-2">Chi tiết chi tiêu</Text>

            {/* Thông tin chính */}
            <View className="bg-white p-4 rounded-xl mb-4 shadow">
                <Text className="text-base font-semibold mb-1">{expense?.note}</Text>
                <Text className="text-slate-600">Người chi: {expense?.payer.name}</Text>
                <Text className="text-slate-600">
                    Ngày: {new Date(expense?.spentAt || "").toLocaleDateString("vi-VN")}
                </Text>
                <Text className="text-slate-600">Danh mục: {expense?.category.name}</Text>
                <Text className="text-slate-900 font-bold mt-2">
                    Tổng: {formatCurrency(expense?.amount || 0 )}
                </Text>
            </View>

            {/* Bảng chi tiết bill */}
            {expense?.bills && expense?.bills.length > 0 && (
                <View className="bg-white rounded-xl shadow">
                    <View className="flex-row px-3 py-2 border-b border-slate-200">
                        <Text className="flex-1 font-semibold">Tên món</Text>
                        <Text className="w-12 text-center font-semibold">SL</Text>
                        <Text className="w-20 text-right font-semibold">Đơn giá</Text>
                        <Text className="w-24 text-right font-semibold">Tổng</Text>
                        <Text className="w-16 text-center font-semibold">Thao tác</Text>
                    </View>
                    <FlatList
                        data={expense?.bills}
                        keyExtractor={(item) => item.id}
                        renderItem={renderBillItem}
                    />
                </View>
            )}

            {/* Chủ nhân từng món */}
            {expense?.bills && (
                <View className="mt-4 bg-white p-4 rounded-xl shadow">
                    <Text className="font-semibold mb-2">Chủ nhân chi phí</Text>
                    {expense?.bills.map((bill) => (
                        <Text key={bill.id} className="text-slate-600">
                            {bill.name}: {bill.owner.map((o) => o.name).join(", ")}
                        </Text>
                    ))}
                </View>
            )}

            {/* Tỉ lệ chia */}
            {expense?.shareRatios && expense?.shareRatios.length > 0 && (
                <View className="mt-4 bg-white p-4 rounded-xl shadow">
                    <Text className="font-semibold mb-2">Tỉ lệ chia</Text>
                    {expense?.shareRatios.map((s, idx) => (
                        <Text key={idx} className="text-slate-600">
                            {s.username}: {s.ratio}%
                        </Text>
                    ))}
                </View>
            )}
        </SafeAreaView>
    );
}
