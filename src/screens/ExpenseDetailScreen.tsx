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
import LoadingOverlay from "../components/LoadingOverlay";

type ExpenseDetailRouteProp = RouteProp<RootStackParamList, "ExpenseDetail">;

export default function ExpenseDetailScreen() {
    const route = useRoute<ExpenseDetailRouteProp>();
    const { expenseId } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const expense = useSelector((state: RootState) => state.groups.selectedGroupId ? state.groups.groups.find(group => group.id === state.groups.selectedGroupId)?.expenses?.find(expense => expense.id === expenseId) : null);
    const loading = useSelector((state: RootState) => state.groups.loading);


    useEffect(() => {
        if (expense?.bills?.length === 0) {
            dispatch(fetchBill(expenseId));
        }
    }, [expenseId]);

    function formatCurrency(value: number) {
        return value.toLocaleString("vi-VN") + "đ";
    }

    const renderBillItem = ({ item }: { item: Bill }) => (
        <View className="flex-row items-center px-3 py-2 border-b border-slate-100">
            <Text style={{ width: '25%' }} className="">{item.name}</Text>
            <Text style={{ width: '10%' }} className="text-center">{item.quantity}</Text>
            <Text style={{ width: '20%' }} className="text-right">{formatCurrency(item.unitPrice)}</Text>
            <Text style={{ width: '20%' }} className="text-right">{formatCurrency(item.totalPrice)}</Text>
            <Text style={{ width: '25%' }} className="text-right">{item.owner.map((o) => o.name).join(", ")}</Text>
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
                    Tổng: {formatCurrency(expense?.amount || 0)}
                </Text>
                {expense?.shareRatios.map((s, index) => (
                    <Text key={`${s.username}-${index}`}>
                        {s.username}: {formatCurrency(s.ratio * expense?.amount)}
                    </Text>
                ))}
            </View>

            {/* Bảng chi tiết bill */}
            {expense?.bills && expense?.bills.length > 0 && (
                <View className="bg-white rounded-xl shadow">
                    <View className="flex-row px-3 py-2 border-b border-slate-200">
                        <Text style={{ width: '25%' }} className="font-semibold">Tên món</Text>
                        <Text style={{ width: '10%' }} className="text-center font-semibold">SL</Text>
                        <Text style={{ width: '20%' }} className="text-right font-semibold">Đơn giá</Text>
                        <Text style={{ width: '20%' }} className="text-right font-semibold">Tổng</Text>
                        <Text style={{ width: '25%' }} className="text-right font-semibold">Chủ nhân</Text>
                    </View>
                    <FlatList
                        data={expense?.bills}
                        keyExtractor={(item) => item.id}
                        renderItem={renderBillItem}
                    />
                </View>
            )}
            <LoadingOverlay visible={loading} text="Đang tải hóa đơn..." />
        </SafeAreaView>
    );
}
