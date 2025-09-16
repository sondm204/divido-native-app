import { View, Text, FlatList, TouchableOpacity, SafeAreaView, TextInput } from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";
import type { Expense, Bill } from "../store/slices/expensesSlice"; // file chứa các interface của bạn
import { RootStackParamList } from "../../App";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { fetchBill } from "../store/slices/groupsSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store/store";
import LoadingOverlay from "../components/LoadingOverlay";
import AppButton from "../components/AppButton";
import CustomModal from "../components/CustomModal";
import AppInput from "../components/AppInput";
import { createBill, updateBill } from "../store/slices/groupsSlice";
import { User } from "../store/slices/userSlice";

type ExpenseDetailRouteProp = RouteProp<RootStackParamList, "ExpenseDetail">;

export default function ExpenseDetailScreen() {
    const route = useRoute<ExpenseDetailRouteProp>();
    const { expenseId } = route.params;
    const dispatch = useDispatch<AppDispatch>();
    const expense = useSelector((state: RootState) => state.groups.selectedGroupId ? state.groups.groups.find(group => group.id === state.groups.selectedGroupId)?.expenses?.find(expense => expense.id === expenseId) : null);
    const groupUsers = useSelector((state: RootState) => state.groups.selectedGroupId ? (state.groups.groups.find(g => g.id === state.groups.selectedGroupId)?.users || []) : []);
    const loading = useSelector((state: RootState) => state.groups.loading);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [billName, setBillName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unitPrice, setUnitPrice] = useState("");
    const [owner, setOwner] = useState<User[]>([]);
    const availableOwners = groupUsers.filter(u => !owner.some(o => o.id === u.id));
    useEffect(() => {
        if (expense?.bills?.length === 0) {
            dispatch(fetchBill(expenseId));
        }
    }, [expenseId]);

    function formatCurrency(value?: number) {
        const n = Number(value || 0);
        return n.toLocaleString("vi-VN") + "đ";
    }

    const renderBillItem = ({ item }: { item: Bill }) => (
        <View className="flex-row items-center px-3 py-2 border-b border-slate-100">
            <Text style={{ width: '25%' }} className="">{item.name}</Text>
            <Text style={{ width: '10%' }} className="text-center">{item.quantity}</Text>
            <Text style={{ width: '20%' }} className="text-right">{formatCurrency(item.unitPrice)}</Text>
            <Text style={{ width: '20%' }} className="text-right">{formatCurrency(item.totalPrice)}</Text>
            <Text style={{ width: '15%' }} className="text-right">{(item.owner || []).map((o) => o.name).join(", ")}</Text>
            <TouchableOpacity
                style={{ width: '10%' }}
                onPress={() => {
                    setEditingBill(item);
                    setBillName(item.name);
                    setQuantity(String(item.quantity));
                    setUnitPrice(String(item.unitPrice));
                    setOwner(item.owner || []);
                    setModalVisible(true);
                }}
            >
                <Pencil size={18} color="#334155" />
            </TouchableOpacity>
        </View>
    );

    const resetForm = () => {
        setEditingBill(null);
        setBillName("");
        setQuantity("");
        setUnitPrice("");
        setOwner([]);
        setModalVisible(false);
    };

    const openCreateModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const onSubmitBill = () => {
        if (!expense) return;
        const q = Number(quantity) || 0;
        const up = Number(unitPrice) || 0;
        const total = q * up;
        const newBill: Bill = {
            id: editingBill?.id || undefined,
            name: billName.trim(),
            quantity: q,
            unitPrice: up,
            totalPrice: total,
            owner: owner
        } as Bill;
        if (editingBill) {
            dispatch(updateBill({ id: editingBill.id, bill: newBill }));
        } else {
            dispatch(createBill({ expenseId: expense.id, bill: newBill }));
        }
        resetForm();
    };

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
                    Tổng: {formatCurrency(expense?.amount || 0)}đ
                </Text>
                {expense?.shareRatios.map((s, index) => (
                    <Text key={`${s.username}-${index}`}>
                        {s.username}: {formatCurrency(s.ratio * expense?.amount)}
                    </Text>
                ))}
            </View>

            {/* Bảng chi tiết bill */}
            <AppButton title="Thêm hóa đơn" onPress={openCreateModal} />
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
            <CustomModal
                visible={modalVisible}
                onClose={() => { setModalVisible(false); resetForm(); }}
                onConfirm={onSubmitBill}
                confirmText={editingBill ? "Cập nhật" : "Thêm"}
            >
                <View>
                    <Text className="text-base font-semibold mb-3">{editingBill ? "Cập nhật hóa đơn" : "Thêm hóa đơn"}</Text>
                    <View className="gap-3">
                        <AppInput
                            label="Tên món"
                            value={billName}
                            onChangeText={setBillName}
                            placeholder="Nhập tên món"
                        />
                        <AppInput
                            label="Số lượng"
                            value={quantity}
                            onChangeText={setQuantity}
                            placeholder="0"
                            keyboardType="numeric"
                        />
                        <AppInput
                            label="Đơn giá"
                            value={unitPrice}
                            onChangeText={setUnitPrice}
                            placeholder="0"
                            keyboardType="numeric"
                        />
                        <View className="gap-3">
                            <View className="p-2 border border-slate-200 rounded-lg">
                                <Text className="text-sm text-slate-600 mb-2">Đã chọn</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {owner.length === 0 && (
                                        <Text className="text-slate-400">Chưa chọn ai</Text>
                                    )}
                                    {owner.map((user) => (
                                        <Text
                                            key={user.id || `${user.email || user.name}-${user.name}`}
                                            onPress={() => setOwner(owner.filter((o) => o.id !== user.id))}
                                            className="bg-blue-500 text-white rounded-full py-1 px-4 active:bg-blue-600">
                                            {user.name}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                            <View className="p-2 border border-slate-200 rounded-lg">
                                <Text className="text-sm text-slate-600 mb-2">Thành viên</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {availableOwners.length === 0 && (
                                        <Text className="text-slate-400">Không còn thành viên</Text>
                                    )}
                                    {availableOwners.map((user) => (
                                        <Text
                                            key={user.id || `${user.email || user.name}-${user.name}`}
                                            onPress={() => setOwner([...owner, user])}
                                            className="bg-slate-100 text-slate-800 rounded-full py-1 px-3 active:bg-slate-200">
                                            {user.name}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </CustomModal>
            <LoadingOverlay visible={loading} text="Đang tải hóa đơn..." />
        </SafeAreaView>
    );
}
