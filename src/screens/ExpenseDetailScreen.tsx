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
import { useState } from "react";
import { Modal, TextInput, Button } from "react-native";
type ExpenseDetailRouteProp = RouteProp<RootStackParamList, "ExpenseDetail">;

export default function ExpenseDetailScreen() {
    const route = useRoute<ExpenseDetailRouteProp>();
    const { expenseId } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const expense = useSelector((state: RootState) => state.groups.currentGroup?.expenses?.find(expense => expense.id === expenseId));
    const loading = useSelector((state: RootState) => state.groups.loading);


    useEffect(() => {
        if(expense?.bills?.length === 0) {
            dispatch(fetchBill(expenseId));
        }
    }, [expenseId]);
 function handleCreate() {
    navigation.reload();
  }

const [showAddBill, setShowAddBill] = useState(false);
const [billName, setBillName] = useState("");
const [billAmount, setBillAmount] = useState("");
const [billPrice, setBillPrice] = useState("");

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
            <LoadingOverlay visible={loading} text="Đang tải hóa đơn..." />
            <TouchableOpacity
                className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full items-center justify-center shadow"
                onPress={() => setShowAddBill(true)} // mở form
            >
                <Text className="text-white text-2xl font-bold">+</Text>
            </TouchableOpacity>
            {/* Modal Form */}
            <Modal
                visible={showAddBill}
                animationType="slide"
                transparent
                onRequestClose={() => setShowAddBill(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/40">
                    <View className="bg-white w-80 p-4 rounded-xl">
                        <Text className="text-lg font-bold mb-3">Thêm bill</Text>

                        <TextInput
                            placeholder="Tên món"
                            value={billName}
                            onChangeText={setBillName}
                            className="border border-gray-300 rounded-md px-2 py-1 mb-3"
                        />
                        <TextInput
                            placeholder="Số lượng"
                            keyboardType="numeric"
                            value={billAmount}
                            onChangeText={setBillAmount}
                            className="border border-gray-300 rounded-md px-2 py-1 mb-3"
                        />
                        <TextInput
                            placeholder="Số tiền"
                            keyboardType="numeric"
                            value={billPrice}
                            onChangeText={setBillPrice}
                            className="border border-gray-300 rounded-md px-2 py-1 mb-3"
                        />

                        <View className="flex-row justify-end">
                            <Button title="Hủy" onPress={() => setShowAddBill(false)} />
                            <View style={{ width: 8 }} />
                            <Button
                              title="Lưu"
                              onPress={() => {
                                if (!billName || !billAmount || !billPrice) {
                                  alert("Vui lòng nhập đầy đủ thông tin");
                                  return;
                                }

                                dispatch(
                                  createBill({
                                    expenseId: expenseId,
                                    name: billName,
                                    quantity: Number(billAmount),
                                    unitPrice: Number(billPrice),
                                  })
                                )
                                  .unwrap()
                                  .then(() => {
                                    setShowAddBill(false);
                                    setBillName("");
                                    setBillAmount("");
                                    setBillPrice("");

                                    dispatch(fetchBills(expenseId));
                                  })
                                  .catch(() => {
                                    alert("Thêm bill thất bại!");
                                  });
                              }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
